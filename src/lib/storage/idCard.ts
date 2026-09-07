import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env, isStorageConfigured } from "@/lib/env";
import { MAX_ID_CARD_BYTES } from "@/lib/validation/registration";

/**
 * ID card intake.
 *
 * ID cards are personal documents, so:
 *   - the browser's declared MIME type is treated as a hint and re-derived
 *     from the file's magic bytes;
 *   - the client filename never reaches storage — the object key is generated
 *     server-side from the user id and a UUID;
 *   - uploads use Cloudinary's `authenticated` delivery type, so the asset is
 *     not reachable by guessing a URL. Viewing goes through a signed,
 *     short-lived URL issued by an authenticated route.
 *
 * Credentials stay on the server: the browser posts the file to our own route
 * handler and never talks to Cloudinary.
 */

export type StoredIdCard = {
  publicId: string;
  resourceType: string;
  format?: string;
  bytes: number;
  originalName?: string;
};

export type UploadFailure = {
  ok: false;
  code: "EMPTY" | "TOO_LARGE" | "BAD_TYPE" | "NOT_CONFIGURED" | "UPLOAD_FAILED";
  message: string;
};

export type UploadResult = { ok: true; file: StoredIdCard } | UploadFailure;

/* ------------------------------------------------------------------ *
 * content sniffing
 * ------------------------------------------------------------------ */

type Sniffed = { mime: string; ext: string; raw: boolean };

const startsWith = (buf: Uint8Array, sig: number[], offset = 0) =>
  sig.every((byte, i) => buf[offset + i] === byte);

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];

/** Derives the real type from the bytes. Returns null for anything unlisted. */
export function sniffIdCard(buf: Uint8Array): Sniffed | null {
  if (startsWith(buf, JPEG)) return { mime: "image/jpeg", ext: "jpg", raw: false };
  if (startsWith(buf, PNG)) return { mime: "image/png", ext: "png", raw: false };
  if (startsWith(buf, RIFF) && startsWith(buf, WEBP, 8))
    return { mime: "image/webp", ext: "webp", raw: false };
  if (startsWith(buf, PDF)) return { mime: "application/pdf", ext: "pdf", raw: true };
  return null;
}

/* ------------------------------------------------------------------ *
 * upload
 * ------------------------------------------------------------------ */

let configured = false;
function configure() {
  if (configured) return;
  const c = env.cloudinary;
  cloudinary.config({
    cloud_name: c.cloudName,
    api_key: c.apiKey,
    api_secret: c.apiSecret,
    secure: true,
  });
  configured = true;
}

/** Validates the bytes, then stores them. Never throws — callers get a result. */
export async function uploadIdCard(
  file: File | null | undefined,
  userId: string,
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, code: "EMPTY", message: "Attach a photo of your ID card" };
  }
  if (file.size > MAX_ID_CARD_BYTES) {
    return { ok: false, code: "TOO_LARGE", message: "ID card must be 5 MB or smaller" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Re-check after reading: `size` is client-reported until the body lands.
  if (bytes.byteLength === 0) {
    return { ok: false, code: "EMPTY", message: "Attach a photo of your ID card" };
  }
  if (bytes.byteLength > MAX_ID_CARD_BYTES) {
    return { ok: false, code: "TOO_LARGE", message: "ID card must be 5 MB or smaller" };
  }

  const sniffed = sniffIdCard(bytes);
  if (!sniffed) {
    return {
      ok: false,
      code: "BAD_TYPE",
      message: "ID card must be a JPG, PNG, WebP or PDF",
    };
  }

  if (!isStorageConfigured()) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Uploads are not configured yet. Contact mission control.",
    };
  }

  configure();

  // Server-generated key. The client's filename is kept only as a label.
  const publicId = `${env.cloudinary.folder}/${userId}/${randomUUID()}`;
  const resourceType = sniffed.raw ? "raw" : "image";

  try {
    const result = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          type: "authenticated", // not reachable by guessing a URL
          overwrite: true,
          invalidate: true,
        },
        (error, uploaded) => {
          if (error || !uploaded) return reject(error ?? new Error("empty response"));
          resolve(uploaded as unknown as CloudinaryUploadResponse);
        },
      );
      stream.end(Buffer.from(bytes));
    });

    return {
      ok: true,
      file: {
        publicId: result.public_id,
        resourceType: result.resource_type ?? resourceType,
        format: result.format ?? sniffed.ext,
        bytes: result.bytes ?? bytes.byteLength,
        originalName: safeLabel(file.name),
      },
    };
  } catch (error) {
    console.error("[storage] id card upload failed", error);
    return {
      ok: false,
      code: "UPLOAD_FAILED",
      message: "Could not store your ID card. Try again.",
    };
  }
}

type CloudinaryUploadResponse = {
  public_id: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
};

/** Removes an object — used to clean up when the registration write fails. */
export async function deleteIdCard(card: StoredIdCard): Promise<void> {
  try {
    if (!isStorageConfigured()) return;
    configure();
    await cloudinary.uploader.destroy(card.publicId, {
      resource_type: card.resourceType,
      type: "authenticated",
      invalidate: true,
    });
  } catch (error) {
    console.error("[storage] id card cleanup failed", error);
  }
}

/** A short-lived signed URL. Only ever handed out by an authenticated route. */
export function signedIdCardUrl(card: StoredIdCard, ttlSeconds = 120): string | null {
  if (!isStorageConfigured()) return null;
  configure();
  return cloudinary.url(card.publicId, {
    resource_type: card.resourceType,
    type: "authenticated",
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

/** Keeps a human-readable label without letting a filename become a path. */
function safeLabel(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^[._]+/, "");
  return cleaned.slice(0, 120) || "id-card";
}
