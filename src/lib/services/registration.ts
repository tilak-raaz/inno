import { randomBytes } from "node:crypto";
import { connectDb, Registration } from "@/lib/db";
import type { RegistrationDoc } from "@/lib/models/Registration";
import type { StoredIdCard } from "@/lib/storage/idCard";
import { collegeKey, rollKey, type Profile } from "@/lib/validation/registration";

/**
 * Registration service — the only module that touches the registrations
 * collection. Route handlers authenticate and validate; this decides.
 *
 * Duplicates are caught twice on purpose:
 *   1. a read-before-write, so the user gets a message naming the exact field;
 *   2. the unique indexes, which are what actually holds under a race.
 * Step 1 is UX. Step 2 is correctness.
 */

export type PublicRegistration = {
  registrationId: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  college: string;
  rollNumber: string;
  tshirtSize?: string;
  referralCode?: string;
  idCardName?: string;
  createdAt: string;
};

export type DuplicateField =
  | "account"
  | "email"
  | "phoneNumber"
  | "whatsappNumber"
  | "rollNumber";

export type CreateResult =
  | { ok: true; registration: PublicRegistration }
  | { ok: false; code: "DUPLICATE"; field: DuplicateField; message: string }
  | { ok: false; code: "DB_ERROR"; message: string };

/** What Mongoose hands back from `.lean()`. */
type LeanRegistration = RegistrationDoc & { createdAt?: Date };

/**
 * The unique constraints, described once.
 *
 * Both duplicate paths read from this table — the pre-flight query builds its
 * `$or` from `match`, and the E11000 handler maps the offending index back to
 * a field using `indexKeys`. Previously those two lists were maintained
 * separately, which is exactly the kind of pair that drifts apart.
 */
const CONSTRAINTS: {
  field: DuplicateField;
  message: string;
  indexKeys: string[];
  match: (userId: string, profile: Profile) => Record<string, unknown>;
}[] = [
  {
    field: "account",
    message: "This account already has a registration.",
    indexKeys: ["userId"],
    match: (userId) => ({ userId }),
  },
  {
    field: "email",
    message: "That email address is already registered.",
    indexKeys: ["email"],
    match: (_userId, p) => ({ email: p.email }),
  },
  {
    field: "phoneNumber",
    message: "That phone number is already registered.",
    indexKeys: ["phoneNumber"],
    match: (_userId, p) => ({ phoneNumber: p.phoneNumber }),
  },
  {
    field: "whatsappNumber",
    message: "That WhatsApp number is already registered.",
    indexKeys: ["whatsappNumber"],
    match: (_userId, p) => ({ whatsappNumber: p.whatsappNumber }),
  },
  {
    // Compound: a roll number is unique within a college, not globally.
    field: "rollNumber",
    message: "That roll number is already registered for this college.",
    indexKeys: ["collegeKey", "rollKey"],
    match: (_userId, p) => ({
      collegeKey: collegeKey(p.college),
      rollKey: rollKey(p.rollNumber),
    }),
  },
];

/** IV26-XXXXXX — unambiguous alphabet, no I/O/0/1. */
function newRegistrationId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (const byte of randomBytes(6)) out += alphabet[byte % alphabet.length];
  return `IV26-${out}`;
}

/** Strips storage keys and internal ids; this is what reaches the browser. */
function toPublic(doc: LeanRegistration): PublicRegistration {
  return {
    registrationId: doc.registrationId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    gender: doc.gender,
    email: doc.email,
    phoneNumber: doc.phoneNumber,
    whatsappNumber: doc.whatsappNumber,
    college: doc.college,
    rollNumber: doc.rollNumber,
    tshirtSize: doc.tshirtSize ?? undefined,
    referralCode: doc.referralCode ?? undefined,
    idCardName: doc.idCard?.originalName ?? undefined,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  };
}

/** The signed-in user's registration, or null. Identity comes from the session. */
export async function findByUserId(userId: string): Promise<PublicRegistration | null> {
  await connectDb();
  const doc = await Registration.findOne({ userId }).lean<LeanRegistration>();
  return doc ? toPublic(doc) : null;
}

/** The stored ID card reference for a user — for the signed-URL route only. */
export async function findIdCardByUserId(userId: string): Promise<StoredIdCard | null> {
  await connectDb();
  const doc = await Registration.findOne({ userId })
    .select("idCard")
    .lean<Pick<RegistrationDoc, "idCard">>();
  return (doc?.idCard as StoredIdCard | undefined) ?? null;
}

/**
 * Read-before-write duplicate check. Returns the first conflicting field so
 * the form can point at it, rather than failing with a generic message.
 */
async function findConflict(
  userId: string,
  profile: Profile,
): Promise<DuplicateField | null> {
  const clash = await Registration.findOne({
    $or: CONSTRAINTS.map((c) => c.match(userId, profile)),
  })
    .select("userId email phoneNumber whatsappNumber collegeKey rollKey")
    .lean<Record<string, string>>();

  if (!clash) return null;

  // Report the first constraint the found document actually violates.
  for (const c of CONSTRAINTS) {
    const criteria = Object.entries(c.match(userId, profile));
    if (criteria.every(([key, value]) => clash[key] === value)) return c.field;
  }
  return "account";
}

/** Maps a Mongo E11000 error onto the field the user needs to change. */
function fieldFromDuplicateKeyError(error: unknown): DuplicateField | null {
  const { code, keyPattern } = (error ?? {}) as {
    code?: number;
    keyPattern?: Record<string, unknown>;
  };
  if (code !== 11000) return null;
  const keys = Object.keys(keyPattern ?? {});
  return (
    CONSTRAINTS.find((c) => c.indexKeys.some((k) => keys.includes(k)))?.field ?? null
  );
}

function isRegistrationIdCollision(error: unknown): boolean {
  const { code, keyPattern } = (error ?? {}) as {
    code?: number;
    keyPattern?: Record<string, unknown>;
  };
  return code === 11000 && Object.keys(keyPattern ?? {}).includes("registrationId");
}

const ID_ATTEMPTS = 4;

export async function createRegistration(params: {
  userId: string;
  userEmail: string;
  profile: Profile;
  idCard: StoredIdCard;
}): Promise<CreateResult> {
  const { userId, userEmail, profile, idCard } = params;
  await connectDb();

  const conflict = await findConflict(userId, profile);
  if (conflict) {
    const { message } = CONSTRAINTS.find((c) => c.field === conflict)!;
    return { ok: false, code: "DUPLICATE", field: conflict, message };
  }

  // Retry only on a registrationId collision — the one duplicate that is ours
  // to fix rather than the user's.
  for (let attempt = 1; attempt <= ID_ATTEMPTS; attempt++) {
    try {
      const doc = await Registration.create({
        userId,
        userEmail,
        registrationId: newRegistrationId(),
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        whatsappNumber: profile.whatsappNumber,
        college: profile.college,
        collegeKey: collegeKey(profile.college),
        rollNumber: profile.rollNumber,
        rollKey: rollKey(profile.rollNumber),
        tshirtSize: profile.tshirtSize,
        referralCode: profile.referralCode,
        idCard,
      });
      return { ok: true, registration: toPublic(doc.toObject<LeanRegistration>()) };
    } catch (error) {
      const field = fieldFromDuplicateKeyError(error);
      if (field) {
        const { message } = CONSTRAINTS.find((c) => c.field === field)!;
        return { ok: false, code: "DUPLICATE", field, message };
      }
      if (isRegistrationIdCollision(error) && attempt < ID_ATTEMPTS) continue;

      console.error("[registration] create failed", error);
      return { ok: false, code: "DB_ERROR", message: "Could not save your registration." };
    }
  }

  console.error(`[registration] gave up after ${ID_ATTEMPTS} id collisions`);
  return { ok: false, code: "DB_ERROR", message: "Could not save your registration." };
}
