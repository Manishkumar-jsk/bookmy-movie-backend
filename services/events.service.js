//models
import Event from "../models/Event.js";
import Category from "../models/Category.js";

//utils
import AppError from "../utils/AppError.js";

//validations
import { createEventSchema, idSchema } from "../validation/event.schema.js";

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
  console.log(ticketTypes, "ticbh");

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

  console.log(data, "data");

  const event = await Event.create({
    ...data,
    image: image,
    createdBy: userId,
    category: categorys._id,
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
