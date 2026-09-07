import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * Integration tests for the registration service against a real MongoDB, so
 * the unique indexes are genuinely exercised rather than mocked away.
 *
 * MONGO_URI is set before the modules load, because `lib/env` reads it lazily
 * on first use.
 */

let mongo: MongoMemoryServer;
let service: typeof import("../src/lib/services/registration.ts");
let db: typeof import("../src/lib/db/index.ts");
let mongoose: typeof import("mongoose");

const idCard = {
  publicId: "innovision2026/id-cards/u1/abc",
  resourceType: "image",
  format: "jpg",
  bytes: 12345,
  originalName: "id.jpg",
};

const baseProfile = {
  firstName: "Ananya",
  lastName: "Mohapatra",
  gender: "Female" as const,
  email: "ananya@example.com",
  phoneNumber: "+919876543210",
  whatsappNumber: "+919876543211",
  college: "NIT Rourkela",
  rollNumber: "124EI0035",
  tshirtSize: undefined,
  referralCode: undefined,
  consent: true as const,
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri("innovision_test");
  process.env.MONGO_TRANSACTIONS = "false"; // in-memory server is standalone

  service = await import("../src/lib/services/registration.ts");
  db = await import("../src/lib/db/index.ts");
  mongoose = (await import("mongoose")).default as never;
  await db.connectDb();
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await db.Registration.deleteMany({});
});

/** Narrows a failed result to its duplicate field, with a useful message if it isn't one. */
function duplicateField(result: Awaited<ReturnType<typeof create>>) {
  assert.equal(result.ok, false, `expected a duplicate failure, got ${JSON.stringify(result)}`);
  assert.ok("field" in result, `expected DUPLICATE, got ${JSON.stringify(result)}`);
  return result.field;
}

const create = (userId: string, overrides: Partial<typeof baseProfile> = {}) =>
  service.createRegistration({
    userId,
    userEmail: `${userId}@gmail.com`,
    profile: { ...baseProfile, ...overrides } as never,
    idCard,
  });

describe("creating a registration", () => {
  it("succeeds and issues a reference", async () => {
    const result = await create("user-1");
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.match(result.registration.registrationId, /^IV26-[A-Z2-9]{6}$/);
    assert.equal(result.registration.firstName, "Ananya");
    assert.equal(result.registration.tshirtSize, undefined);
  });

  it("succeeds without a t-shirt size", async () => {
    const result = await create("user-1", { tshirtSize: undefined });
    assert.equal(result.ok, true);
    const doc = await db.Registration.findOne({ userId: "user-1" }).lean();
    assert.equal((doc as Record<string, unknown>).tshirtSize, undefined);
  });

  it("stores a supplied t-shirt size", async () => {
    const result = await create("user-1", { tshirtSize: "XXXL" as never });
    assert.equal(result.ok, true);
    assert.equal(result.registration.tshirtSize, "XXXL");
  });

  it("stores an optional referral code", async () => {
    const result = await create("user-1", { referralCode: "CA-2026" as never });
    assert.equal(result.ok, true);
    assert.equal(result.registration.referralCode, "CA-2026");
  });

  it("issues distinct references across registrations", async () => {
    const a = await create("user-1");
    const b = await create("user-2", {
      email: "b@example.com",
      phoneNumber: "+919000000002",
      whatsappNumber: "+919000000012",
      rollNumber: "124EI0099",
    });
    assert.equal(a.ok && b.ok, true);
    assert.notEqual(
      (a as { registration: { registrationId: string } }).registration.registrationId,
      (b as { registration: { registrationId: string } }).registration.registrationId,
    );
  });
});

describe("duplicate prevention", () => {
  beforeEach(async () => {
    const seeded = await create("user-1");
    assert.equal(seeded.ok, true);
  });

  it("blocks a second registration on the same account", async () => {
    const again = await create("user-1", {
      email: "other@example.com",
      phoneNumber: "+919000000003",
      whatsappNumber: "+919000000013",
      rollNumber: "124EI0100",
    });
    assert.equal(duplicateField(again), "account");
  });

  it("blocks a duplicate email from a different account", async () => {
    const result = await create("user-2", {
      phoneNumber: "+919000000004",
      whatsappNumber: "+919000000014",
      rollNumber: "124EI0101",
    });
    assert.equal(duplicateField(result), "email");
  });

  it("blocks a duplicate phone number", async () => {
    const result = await create("user-2", {
      email: "c@example.com",
      whatsappNumber: "+919000000015",
      rollNumber: "124EI0102",
    });
    assert.equal(duplicateField(result), "phoneNumber");
  });

  it("blocks a duplicate WhatsApp number", async () => {
    const result = await create("user-2", {
      email: "d@example.com",
      phoneNumber: "+919000000005",
      rollNumber: "124EI0103",
    });
    assert.equal(duplicateField(result), "whatsappNumber");
  });

  it("blocks the same roll number at the same college", async () => {
    const result = await create("user-2", {
      email: "e@example.com",
      phoneNumber: "+919000000006",
      whatsappNumber: "+919000000016",
      college: "N.I.T  Rourkela", // written differently, same institution
    });
    assert.equal(duplicateField(result), "rollNumber");
  });

  it("allows the same roll number at a different college", async () => {
    const result = await create("user-2", {
      email: "f@example.com",
      phoneNumber: "+919000000007",
      whatsappNumber: "+919000000017",
      college: "IIT Bombay",
    });
    assert.equal(result.ok, true, "roll numbers are unique per college, not globally");
  });

  it("holds at the database level when the read check is bypassed", async () => {
    // Simulates two requests racing past findConflict at the same instant.
    await assert.rejects(
      db.Registration.create({
        userId: "user-99",
        userEmail: "race@gmail.com",
        registrationId: "IV26-RACER1",
        ...baseProfile,
        collegeKey: "nitrourkela",
        rollKey: "124EI0035",
        idCard,
      }),
      (error: { code?: number }) => error.code === 11000,
      "the unique index, not the read check, is the real guarantee",
    );
  });
});

describe("lookups", () => {
  it("finds a registration by the session user id", async () => {
    await create("user-1");
    const found = await service.findByUserId("user-1");
    assert.equal(found?.email, "ananya@example.com");
  });

  it("returns null for an account with no registration", async () => {
    assert.equal(await service.findByUserId("nobody"), null);
  });

  it("never exposes internal storage keys in the public shape", async () => {
    await create("user-1");
    const found = await service.findByUserId("user-1");
    assert.ok(found);
    assert.equal("idCard" in found, false, "publicId must not reach the client");
    assert.equal("userId" in found, false);
    assert.equal(found.idCardName, "id.jpg");
  });
});
