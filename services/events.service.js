//models
import Event from "../models/Event.js";

//utils
import AppError from "../utils/AppError.js";

//validations
import { createEventSchema, idSchema } from "../validation/event.schema.js";

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
  const parsed = createEventSchema.safeParse({
    title,
    description,
    date,
    location,
    price,
    totalTickets,
    availableTickets,
  });
  if (!parsed.success) {
    throw new AppError(parsed?.error?.issues[0].message, 400);
  }

  const data = parsed?.data;

  const event = await Event.create({
    ...data,
    createdBy: userId,
  });

  return event;
};

export const getEventsService = async () => {
  const events = await Event.find();

  return events;
};

export const getEventsByIdService = async ({ id }) => {
  const parsed = idSchema.safeParse({ id });
  const data = parsed?.data;

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const event = await Event.findById(data.id);

  return event;
};

export const deleteEventService = async ({ id }) => {
  const parsed = idSchema.safeParse({ id });
  const data = parsed?.data;

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const event = await Event.findByIdAndDelete(data.id);

  return event;
};
