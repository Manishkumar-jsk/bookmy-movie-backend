import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string({ required_error: "Title is required" }).trim(),
  description: z.string({ required_error: "Description is required" }).trim(),
  date: z.coerce.date({ required_error: "Date is required" }),
  location: z.string({ required_error: "Location is required" }).trim(),
  category: z.string({ required_error: "Category is required" }).trim(),
  ticketTypes: z
    .array(
      z.object({
        type: z.enum(["VIP", "Gold", "Silver"]),
        price: z.number().min(0),
        totalSeats: z.number().min(1),
      }),
    )
    .min(1),
});

export const idSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
});
