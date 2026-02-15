import { z } from "zod";

export const userSigninSchema = z.object({
  name: z.string({ required_error: "name is required" }).trim(),
  email: z
    .string({ required_error: "email is required" })
    .email()
    .trim()
    .transform((data) => data.toLowerCase()),
  password: z
    .string({ required_error: "password is required" })
    .min(6, "min 6 characters are required")
    .trim(),
});

export const userLoginSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email()
    .trim()
    .transform((data) => data.toLowerCase()),
  password: z
    .string({ required_error: "password is required" })
    .min(6, "min 6 characters are required")
    .trim(),
});
