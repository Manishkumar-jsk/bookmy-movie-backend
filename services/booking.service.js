//models
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import { createBookingSchema } from "../validation/booking.schema.js";

//utils
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export const bookingService = async ({
  userId,
  eventId,
  quantity,
  ticketTypeId,
}) => {
  const parsed = createBookingSchema.safeParse({
    eventId,
    quantity,
    ticketTypeId,
  });

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const data = parsed?.data;
  const event = await Event.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(data.eventId),
      "ticketTypes._id": new mongoose.Types.ObjectId(data.ticketTypeId),
      "ticketTypes.availableSeats": { $gte: data.quantity },
    },
    {
      $inc: { "ticketTypes.$.availableSeats": -data.quantity },
    },
    { new: true },
  );

  if (!event) {
    throw new AppError("Event not found or not enough tickets available", 400);
  }

  const ticket = event.ticketTypes.find(
    (t) => t._id.toString() === data.ticketTypeId,
  );

  const totalAmount = ticket.price * data.quantity;
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
