import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string({ required_error: "Title is required" }).trim(),
  description: z.string({ required_error: "Description is required" }).trim(),
  date: z.coerce.date({ required_error: "Date is required" }),
  location: z.string({ required_error: "Location is required" }).trim(),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Pirce cannot be negative"),
  totalTickets: z
    .number({
      required_error: "Total Tickets is required",
      invalid_type_error: "Total Tickets must be a number",
    })
    .int("Total tickets must be an integer")
    .min(1, "Minimum 1 ticket required"),
  availableTickets: z
    .number({
      required_error: "Available Ticket is required",
      invalid_type_error: "Available Ticket must be a number",
    })
    .min(0),
  category:z.string({required_error:"Category is required"}).trim()
});


export const idSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
});