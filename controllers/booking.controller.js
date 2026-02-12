//services
import { bookingService } from "../services/booking.service.js";

export const bookEvent = async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;

    await bookingService({ userId: req.user.id, eventId, quantity });
    res
      .status(201)
      .json({ success: true, message: "Event booked successfully" });
  } catch (error) {
    next(error);
  }
};
