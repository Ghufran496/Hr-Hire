import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(2, "Title is too short.").max(120),
  short_description: z
    .string()
    .min(10, "Short description must be at least 10 characters.")
    .max(280),
  description: z.string().min(20, "Description is too short."),
  requirements: z.string().min(10, "Requirements are too short."),
  location: z.string().max(120).optional().or(z.literal("")),
  employment_type: z.string().max(80).optional().or(z.literal("")),
});

export type JobInput = z.infer<typeof jobSchema>;
