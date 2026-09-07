import { z } from "zod";

/** Shared by the form and the route handler so both agree on what is valid. */

export const identitySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{8,16}$/, "Enter a valid phone number"),
  institution: z.string().trim().min(2, "Enter your college or school"),
  year: z.enum(["School", "1st", "2nd", "3rd", "4th", "5th+", "Graduate"], {
    message: "Select your year of study",
  }),
});

export const missionSchema = z.object({
  events: z.array(z.string()).min(1, "Pick at least one event"),
  teamName: z.string().trim().max(40, "Keep it under 40 characters").optional(),
});

export const logisticsSchema = z.object({
  arrival: z.enum(["06 Nov", "07 Nov", "08 Nov", "09 Nov"], {
    message: "Select your arrival day",
  }),
  accommodation: z.enum(["yes", "no"], { message: "Let us know about accommodation" }),
  tshirt: z.enum(["XS", "S", "M", "L", "XL", "XXL"], { message: "Select a size" }),
  notes: z.string().trim().max(300, "Keep it under 300 characters").optional(),
  consent: z.literal(true, { message: "You must accept the code of conduct" }),
});

export const registrationSchema = identitySchema
  .and(missionSchema)
  .and(logisticsSchema);

export type Registration = z.infer<typeof registrationSchema>;

export const YEARS = ["School", "1st", "2nd", "3rd", "4th", "5th+", "Graduate"] as const;
export const ARRIVALS = ["06 Nov", "07 Nov", "08 Nov", "09 Nov"] as const;
export const TSHIRTS = ["XS", "S", "M", "L", "XL", "XXL"] as const;
