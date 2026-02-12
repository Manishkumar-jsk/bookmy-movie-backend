//models
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

//utils
import AppError from "../utils/AppError.js";

export const bookingService = async ({ userId, eventId, quantity }) => {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, availableTickets: { $gte: +quantity } },
    { $inc: { availableTickets: -+quantity } },
    { new: true },
  ).select("price title");

  if (!event) {
    throw new AppError("Event not found or not enough tickets available", 400);
  }

  const totalAmount = event?.price * quantity;
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
