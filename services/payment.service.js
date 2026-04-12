import razorpay from "../config/razorpay.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/AppError.js";
import crypto from "crypto";

export const createOrder = async ({
  eventId,
  ticketType,
  quantity,
  userId,
}) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);

  if (new Date(event.date) < new Date()) {
    throw new AppError("Event already completed", 400);
  }

  const selectedTicket = event.ticketTypes.find((t) => t.type === ticketType);

  if (!selectedTicket) {
    throw new AppError(`${ticketType} ticket type not found`, 404);
  }

  if (selectedTicket.availableSeats < quantity) {
    throw new AppError(`Only ${selectedTicket.availableSeats} seats left`, 400);
  }

  const totalAmount = selectedTicket.price * quantity;
  const totalAmountPaise = totalAmount * 100;

  const booking = await Booking.create({
    user: userId,
    event: eventId,
    ticketType,
    bookingId: generateBookingId(),
    quantity,
    totalAmount,
    paymentStatus: "pending",
    bookingStatus: "pending",
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmountPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      bookingId: booking._id.toString(),
    },
  });

  booking.razorpayOrderId = razorpayOrder.id;
  await booking.save();

  return {
    orderId: razorpayOrder.id,
    amount: totalAmountPaise,
    currency: "INR",
    bookingId: booking._id,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  bookingId,
}) => {
  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpaySignature) {
    throw new AppError("Invalid signature", 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);

  if (booking.paymentStatus === "success") {
    return { booking, message: "Already confirmed" };
  }

  booking.paymentStatus = "success";
  booking.bookingStatus = "processing";
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.razorpaySignature = razorpaySignature;

  await booking.save();

  const populated = await booking.populate("event", "title date location");

  console.log(populated,"populated")

  return populated;
};

const generateBookingId = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `EB${random}`;
};
