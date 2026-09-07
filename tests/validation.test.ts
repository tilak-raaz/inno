import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  academicSchema,
  collegeKey,
  logisticsSchema,
  normalizePhone,
  personalSchema,
  registrationSchema,
  rollKey,
} from "../src/lib/validation/registration.ts";

const validProfile = {
  firstName: "Ananya",
  lastName: "Mohapatra",
  gender: "Female",
  email: "  Ananya.M@Example.COM ",
  phoneNumber: "+91 98765-43210",
  whatsappNumber: "+91 98765 43211",
  college: "NIT Rourkela",
  rollNumber: "124ei0035",
  tshirtSize: "",
  referralCode: "",
  consent: true,
};

describe("personal details", () => {
  it("accepts a complete set and normalises it", () => {
    const parsed = personalSchema.parse(validProfile);
    assert.equal(parsed.email, "ananya.m@example.com", "email lower-cased and trimmed");
    assert.equal(parsed.phoneNumber, "+919876543210", "phone reduced to digits");
    assert.equal(parsed.whatsappNumber, "+919876543211");
  });

  it("rejects missing required fields", () => {
    const result = personalSchema.safeParse({ ...validProfile, firstName: "" });
    assert.equal(result.success, false);
    assert.match(result.error!.issues[0].message, /first name/i);
  });

  it("rejects a malformed email", () => {
    for (const email of ["nope", "a@b", "a b@c.com", "@example.com"]) {
      const result = personalSchema.safeParse({ ...validProfile, email });
      assert.equal(result.success, false, `expected ${email} to be rejected`);
    }
  });

  it("rejects a malformed phone number", () => {
    for (const phoneNumber of ["12345", "abcdefghij", "+", "1234567890123456789"]) {
      const result = personalSchema.safeParse({ ...validProfile, phoneNumber });
      assert.equal(result.success, false, `expected ${phoneNumber} to be rejected`);
    }
  });

  it("rejects an unknown gender", () => {
    const result = personalSchema.safeParse({ ...validProfile, gender: "Robot" });
    assert.equal(result.success, false);
  });
});

describe("academic details", () => {
  it("requires college and roll number", () => {
    assert.equal(academicSchema.safeParse({ college: "", rollNumber: "1" }).success, false);
    assert.equal(
      academicSchema.safeParse({ college: "NIT Rourkela", rollNumber: "" }).success,
      false,
    );
  });

  it("rejects a roll number with unsafe characters", () => {
    const result = academicSchema.safeParse({
      college: "NIT Rourkela",
      rollNumber: "124<script>",
    });
    assert.equal(result.success, false);
  });
});

describe("t-shirt size is optional", () => {
  it("succeeds when omitted entirely", () => {
    const { tshirtSize, ...rest } = validProfile;
    void tshirtSize;
    const result = registrationSchema.safeParse(rest);
    assert.equal(result.success, true, JSON.stringify(result.error?.issues));
    assert.equal(result.data!.tshirtSize, undefined);
  });

  it("succeeds when sent as an empty string by an untouched control", () => {
    const result = registrationSchema.safeParse({ ...validProfile, tshirtSize: "" });
    assert.equal(result.success, true);
    assert.equal(result.data!.tshirtSize, undefined);
  });

  it("accepts every documented size, XXXL included", () => {
    for (const size of ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]) {
      const result = registrationSchema.safeParse({ ...validProfile, tshirtSize: size });
      assert.equal(result.success, true, `expected ${size} to be accepted`);
      assert.equal(result.data!.tshirtSize, size);
    }
  });

  it("rejects a size outside the list", () => {
    const result = registrationSchema.safeParse({ ...validProfile, tshirtSize: "XXXXL" });
    assert.equal(result.success, false);
    assert.equal(result.error!.issues[0].path[0], "tshirtSize");
  });
});

describe("referral code is optional", () => {
  it("succeeds when omitted", () => {
    const result = registrationSchema.safeParse({ ...validProfile, referralCode: "" });
    assert.equal(result.success, true);
    assert.equal(result.data!.referralCode, undefined);
  });

  it("upper-cases a supplied code", () => {
    const result = registrationSchema.safeParse({ ...validProfile, referralCode: "ca-2026" });
    assert.equal(result.success, true);
    assert.equal(result.data!.referralCode, "CA-2026");
  });

  it("rejects a code with unsafe characters", () => {
    const result = registrationSchema.safeParse({ ...validProfile, referralCode: "a b!" });
    assert.equal(result.success, false);
  });
});

describe("consent", () => {
  it("must be explicitly true", () => {
    assert.equal(logisticsSchema.safeParse({ consent: false }).success, false);
    assert.equal(logisticsSchema.safeParse({ consent: true }).success, true);
  });
});

describe("normalisers", () => {
  it("reduces differently formatted phone numbers to one value", () => {
    const forms = ["+91 98765 43210", "+91-98765-43210", "+919876543210", "+91 (98765) 43210"];
    const normalised = new Set(forms.map(normalizePhone));
    assert.equal(normalised.size, 1, "all formats collapse to a single canonical value");
    assert.equal([...normalised][0], "+919876543210");
  });

  it("collapses college spelling variations to one key", () => {
    const keys = new Set(["NIT Rourkela", "N.I.T  Rourkela", "nit rourkela"].map(collegeKey));
    assert.equal(keys.size, 1);
  });

  it("upper-cases and de-spaces roll numbers", () => {
    assert.equal(rollKey(" 124ei 0035 "), "124EI0035");
  });
});
