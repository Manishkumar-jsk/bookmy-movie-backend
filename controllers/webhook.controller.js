import crypto from "crypto";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import { getIo } from "../socket/socket.js";
import { publishBookingEmail } from "../producers/booking.producer.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const io = getIo();

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const bookingId = payment.notes.bookingId;

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).send("Booking not found");
      }

      if (booking.paymentStatus === "success") {
        return res.status(200).send("Already processed");
      }

      booking.paymentStatus = "success";
      booking.bookingStatus = "success";

      io.to(booking.user).emit("new-notification", {
        title: "Ticket Confirmed",
        message: "Your booking is successful",
      });

      booking.razorpayPaymentId = payment.id;

      await publishBookingEmail({
    email: "manishsharma65263@gmail.com",
    eventName: "React Conference",
});

      await booking.save();

      await Event.findOneAndUpdate(
        {
          _id: booking.event,
          "ticketTypes.type": booking.ticketType,
        },
        {
          $inc: {
            "ticketTypes.$.availableSeats": -booking.quantity,
          },
        }
      );

    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;

      const bookingId = payment.notes.bookingId;

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
        bookingStatus: "failed",
      });

    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Server error");
  }
};