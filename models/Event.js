import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  ticketTypes: [
    {
      type: {
        type: String,
        enum: ["VIP", "Gold", "Silver"],
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      totalSeats: {
        type: Number,
        required: true,
        min: 1,
      },
      availableSeats: {
        type: Number,
        min: 0,
        default: function () {
          return this.totalSeats;
        },
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

export default mongoose.model("Event", eventSchema);
