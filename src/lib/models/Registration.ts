import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { GENDERS, TSHIRT_SIZES } from "@/lib/validation/registration";

/**
 * A festival registration, one per authenticated account.
 *
 * Uniqueness is deliberate rather than blanket:
 *
 *   userId              unique — the real "one registration per account" rule.
 *                       Taken from the server-side session, never the client.
 *   email               unique — one contact inbox per registration.
 *   phoneNumber         unique — stored digits-only so formatting can't be
 *   whatsappNumber      unique   used to slip a duplicate past the index.
 *   (collegeKey, rollKey) unique — a roll number is only unique *within* a
 *                       college, so this is a compound index. A global unique
 *                       index on rollNumber would wrongly reject two students
 *                       at different colleges who share a roll format.
 *   referralCode        NOT unique — many people legitimately share one code.
 *   tshirtSize          optional, unconstrained.
 *
 * `*Key` fields are normalised copies used purely for the indexes; the plain
 * fields keep what the student actually typed, for correspondence.
 */

const idCardSchema = new Schema(
  {
    publicId: { type: String, required: true },
    resourceType: { type: String, required: true, default: "image" },
    format: { type: String },
    bytes: { type: Number, required: true },
    originalName: { type: String },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const registrationSchema = new Schema(
  {
    /* identity comes from the session, not the payload */
    userId: { type: String, required: true, unique: true, index: true },
    userEmail: { type: String, required: true },

    registrationId: { type: String, required: true, unique: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: GENDERS },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    whatsappNumber: { type: String, required: true, unique: true, trim: true },

    college: { type: String, required: true, trim: true },
    collegeKey: { type: String, required: true },
    rollNumber: { type: String, required: true, trim: true },
    rollKey: { type: String, required: true },

    tshirtSize: { type: String, enum: TSHIRT_SIZES, required: false },
    referralCode: { type: String, required: false, trim: true, uppercase: true },

    idCard: { type: idCardSchema, required: true },
  },
  { timestamps: true, collection: "registrations" },
);

/* A roll number is unique per college, not globally. */
registrationSchema.index({ collegeKey: 1, rollKey: 1 }, { unique: true });

export type RegistrationDoc = InferSchemaType<typeof registrationSchema>;

export const Registration: Model<RegistrationDoc> =
  (mongoose.models.Registration as Model<RegistrationDoc>) ??
  mongoose.model<RegistrationDoc>("Registration", registrationSchema);
