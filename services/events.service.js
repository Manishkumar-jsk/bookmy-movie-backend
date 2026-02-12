//models
import Event from "../models/Event.js";

//utils
import AppError from "../utils/AppError.js";

export const createEventService = async ({
  title,
  description,
  date,
  location,
  price,
  totalTickets,
  availableTickets,
  userId,
}) => {
  if (!title || !description || !date || !location || !price || !totalTickets) {
    throw new AppError("ERequired fields are missing", 400);
  }

  const event = await Event.create({
    title,
    description,
    date,
    location,
    price,
    totalTickets,
    availableTickets,
    createdBy: userId,
  });

  return event;
};

export const getEventsService = async () => {
  const events = await Event.find();

  return events;
};

export const getEventsByIdService = async ({ id }) => {
  const event = await Event.findById(id);

  return event;
};

export const deleteEventService = async ({ id }) => {
  const event = await Event.findByIdAndDelete(id);

  return event;
};
