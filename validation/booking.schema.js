import { z } from "zod";

export const createBookingSchema = z.object({
    eventId:z.string({required_error:"Event id is required"}).regex(/^[0-9a-fA-F]{24}$/,"Invalid Id"),
    quantity:z.number({required_error:"Quantity is required"})
})