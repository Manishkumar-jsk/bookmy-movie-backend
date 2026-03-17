import { z } from "zod";

export const addUserSchema = z.object({
  name: z.string({ required_error: "name is required" }).trim(),
  email: z
    .string({ required_error: "email is required" })
    .email()
    .trim()
    .transform((data) => data.toLowerCase())
});