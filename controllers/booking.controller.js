//services
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import {
  bookingService,
  getBookingStatusService,
} from "../services/booking.service.js";

export const bookEvent = async (req, res, next) => {
  try {
    const { eventId, ticketTypeId, quantity } = req.body;

    await bookingService({
      userId: req.user.id,
      eventId,
      quantity,
      ticketTypeId,
    });
    res
      .status(201)
      .json({ success: true, message: "Event booked successfully" });
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("event", "title location date image")
      .select("event user");
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingStatus = async (req, res, next) => {
  try {
    const booking = await getBookingStatusService({ id: req.params.id });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
