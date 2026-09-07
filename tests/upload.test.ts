import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sniffIdCard } from "../src/lib/storage/idCard.ts";
import { idCardMetaSchema, MAX_ID_CARD_BYTES } from "../src/lib/validation/registration.ts";

/* Minimal headers — enough bytes for the sniffer to identify each format. */
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const webp = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const pdf = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

describe("id card content sniffing", () => {
  it("identifies the accepted formats from their magic bytes", () => {
    assert.equal(sniffIdCard(jpeg)?.mime, "image/jpeg");
    assert.equal(sniffIdCard(png)?.mime, "image/png");
    assert.equal(sniffIdCard(webp)?.mime, "image/webp");
    assert.equal(sniffIdCard(pdf)?.mime, "application/pdf");
  });

  it("routes PDFs to raw storage and images to image storage", () => {
    assert.equal(sniffIdCard(pdf)?.raw, true);
    assert.equal(sniffIdCard(jpeg)?.raw, false);
  });

  it("rejects a payload whose bytes are not an accepted format", () => {
    const html = new TextEncoder().encode("<html><script>alert(1)</script>");
    assert.equal(sniffIdCard(html), null);
  });

  it("rejects an executable renamed to look like an image", () => {
    // Mach-O header — the browser would happily report image/jpeg for this.
    const macho = Uint8Array.from([0xcf, 0xfa, 0xed, 0xfe, 0x0c, 0x00, 0x00, 0x01]);
    assert.equal(sniffIdCard(macho), null, "declared MIME type is never trusted");
  });

  it("rejects a RIFF container that is not WebP", () => {
    const wav = Uint8Array.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    ]);
    assert.equal(sniffIdCard(wav), null);
  });

  it("rejects an empty buffer", () => {
    assert.equal(sniffIdCard(new Uint8Array(0)), null);
  });
});

describe("id card metadata guard", () => {
  it("accepts a reasonable file", () => {
    const result = idCardMetaSchema.safeParse({
      name: "id.jpg",
      size: 900_000,
      type: "image/jpeg",
    });
    assert.equal(result.success, true);
  });

  it("rejects an oversized file", () => {
    const result = idCardMetaSchema.safeParse({
      name: "id.jpg",
      size: MAX_ID_CARD_BYTES + 1,
      type: "image/jpeg",
    });
    assert.equal(result.success, false);
    assert.match(result.error!.issues[0].message, /5 MB/);
  });

  it("rejects an empty file", () => {
    const result = idCardMetaSchema.safeParse({ name: "id.jpg", size: 0, type: "image/jpeg" });
    assert.equal(result.success, false);
  });

  it("rejects a disallowed type", () => {
    for (const type of ["image/gif", "application/zip", "text/html", ""]) {
      const result = idCardMetaSchema.safeParse({ name: "x", size: 100, type });
      assert.equal(result.success, false, `expected ${type} to be rejected`);
    }
  });
});
