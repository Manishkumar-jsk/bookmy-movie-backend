import crypto from "crypto";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    console.log("webhookk")

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
      booking.razorpayPaymentId = payment.id;

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