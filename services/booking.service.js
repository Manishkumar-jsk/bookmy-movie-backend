//models
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import { createBookingSchema } from "../validation/booking.schema.js";

//utils
import AppError from "../utils/AppError.js";

export const bookingService = async ({ userId, eventId, quantity }) => {
  const parsed = createBookingSchema.safeParse({ eventId, quantity });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const data = parsed?.data;
  const event = await Event.findOneAndUpdate(
    { _id: data.eventId, availableTickets: { $gte: +data.quantity } },
    { $inc: { availableTickets: -+data.quantity } },
    { new: true },
  ).select("price title");

  if (!event) {
    throw new AppError("Event not found or not enough tickets available", 400);
  }

  const totalAmount = event?.price * data.quantity;
  const paymentStatus = "success";

  const booking = await Booking.create({
    user: userId,
    event: eventId,
    quantity,
    totalAmount,
    paymentStatus,
  });

  return booking;
};
