import { z } from "zod";

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB

// Fields the candidate types into the form (no file).
export const applicationFieldsSchema = z.object({
  full_name: z
    .string()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .min(6, "Phone number is too short.")
    .max(40, "Phone number is too long."),
  experience: z
    .string()
    .min(20, "Tell us a little more about your experience (min. 20 chars).")
    .max(2000, "Keep it under 2000 characters."),
  skills: z
    .string()
    .min(2, "List a few of your strongest skills.")
    .max(500, "Keep it under 500 characters."),
});

// Full client-side schema including the File field. Server-side validation
// re-derives this on the action with the parsed FormData.
export const applicationClientSchema = applicationFieldsSchema.extend({
  cv: z
    .instanceof(File, { message: "Please attach your CV." })
    .refine((f) => f.size > 0, "Please attach your CV.")
    .refine((f) => f.size <= MAX_CV_BYTES, "CV file is too large (max 5 MB).")
    .refine((f) => f.type === "application/pdf", "CV must be a PDF file."),
});

export type ApplicationClientInput = z.infer<typeof applicationClientSchema>;
export type ApplicationFields = z.infer<typeof applicationFieldsSchema>;

export const MAX_CV_FILE_BYTES = MAX_CV_BYTES;
