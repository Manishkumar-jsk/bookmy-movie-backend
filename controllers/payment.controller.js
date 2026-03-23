import { createOrder, verifyPayment } from "../services/payment.service.js";
import AppError from "../utils/AppError.js";

export const createOrderController = async (req, res, next) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    if (!eventId || !ticketType || !quantity) {
      throw new AppError("eventId, ticketType aur quantity required hai", 400);
    }

    const data = await createOrder({
      eventId,
      ticketType,
      quantity,
      userId: req.user.id,
    });

    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};

export const verifyPaymentController = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } =
      req.body;

    const data = await verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    });

    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};
