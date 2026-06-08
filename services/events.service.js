//models
import Event from "../models/Event.js";
import Category from "../models/Category.js";
import Notification from "../models/Notification.js";

//utils
import AppError from "../utils/AppError.js";

//validations
import { createEventSchema, idSchema } from "../validation/event.schema.js";
import { getIo } from "../socket/socket.js";

export const createEventService = async ({
  title,
  description,
  date,
  location,
  userId,
  image,
  category,
  ticketTypes,
}) => {
  const io = getIo();
  const sockets = await io.in("users").fetchSockets();
  console.log(
    "Users room sockets:",
    sockets.map((s) => s.id),
  );

  const parsed = createEventSchema.safeParse({
    title,
    description,
    date,
    location,
    category,
    ticketTypes,
  });
  if (!parsed.success) {
    throw new AppError(parsed?.error?.issues[0].message, 400);
  }

  const data = parsed?.data;
  const categorys = await Category.findOne({ name: category });

  if (!categorys) {
    throw new AppError("Category not found", 404);
  }

  const event = await Event.create({
    ...data,
    image: image,
    createdBy: userId,
    category: categorys._id,
  });

  const notification = await Notification.create({
    user: userId,
    isGlobal: true,
    title: title,
    message: description,
    type: "Event",
    referenceId: event?._id,
  });

  io.to("users").emit("new-notification", {
    title: title,
    message: description,
  });

  return event;
};

export const getEventsService = async (location) => {
  const filter = {};
  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }
  const events = await Event.find(filter).populate("category", "name");

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

export const updateEventService = async ({
  id,
  title,
  description,
  date,
  location,
  userId,
  image,
  category,
  ticketTypes,
}) => {
  if (!id) {
    throw new AppError("Id is missing", 400);
  }

  const parsed = createEventSchema.safeParse({
    title,
    description,
    date,
    location,
    category,
    ticketTypes,
  });

  if (!parsed.success) {
    throw new AppError(parsed?.error?.issues[0].message, 400);
  }

  const data = parsed?.data;
  const categorys = await Category.findOne({ name: category });

  if (!categorys) {
    throw new AppError("Category not found", 404);
  }

  const existingEvent = await Event.findOne({ _id: id });

  if (!existingEvent) {
    throw new AppError("Event not found", 404);
  }

  const event = await Event.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...data,
        ...(image && { image: image }),
        createdBy: userId,
        category: categorys._id,
      },
    },
    { new: true },
  );

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
