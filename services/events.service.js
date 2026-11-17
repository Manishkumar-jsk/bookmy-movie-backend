//models
import Event from "../models/Event.js";
import Category from "../models/Category.js";
import Notification from "../models/Notification.js";
import ImportLog from "../models/import_log.model.js";


//utils
import AppError from "../utils/AppError.js";

//validations
import { createEventSchema, idSchema } from "../validation/event.schema.js";
import { publishImportFile } from "../producers/import.producer.js";
import { getIo } from "../socket/socket.js";
import redisClient from "../config/redis.js";
import { deleteCache, getCache, setCache } from "../utils/cache.js";

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

  const cacheKey = "events:list";
  await deleteCache(cacheKey)

  const notification = await Notification.create({
    user: userId,
    isGlobal: true,
    title: title,
    message: description,
    type: "EVENT",
    referenceId: event?._id,
  });

  const io = getIo();
  const sockets = await io.in("users").fetchSockets();
  console.log(
    "Users room sockets:",
    sockets.map((s) => s.id),
  );

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

  // const cacheKey = "events:list";
  // const cacheEvents = await getCache(cacheKey);

  // if(cacheEvents){
  //   return cacheEvents;
  // }

  const events = await Event.find(filter).populate("category", "name");
  // await setCache(cacheKey,events,300)

  return events;
};

export const getEventsByIdService = async ({ id }) => {
  const parsed = idSchema.safeParse({ id });
  const data = parsed?.data;

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const cacheKey = `events:${id}`;
  const cacheEvent = await getCache(cacheKey);

  if(cacheEvent){
    return cacheEvent;
  }

  const event = await Event.findById(data.id);
  await setCache(cacheKey,event,300)

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

  const allEventsKey = "events:list";
  const eventById = `events:${id}`;
  await Promise.all([deleteCache(allEventsKey),deleteCache(eventById)])

  return event;
};

export const deleteEventService = async ({ id }) => {
  const parsed = idSchema.safeParse({ id });
  const data = parsed?.data;

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const event = await Event.findByIdAndDelete(data.id);

  const allEventsKey = "events:list";
  const eventById = `events:${id}`;
  await Promise.all([deleteCache(allEventsKey),deleteCache(eventById)])

  return event;
};

export const getImportStatusService = async ({ importId }) => {
  const progressKey = `import_events:${importId}:progress`;

  const progress = await redisClient.hGetAll(progressKey);

  if (Object.keys(progress).length === 0) {
    const importLog = await ImportLog.findById(importId).lean();

    if (!importLog) {
      return res.status(404).json({
        message: "Import not found",
      });
    }

    return {
      status: importLog.status,
      total: importLog.total_records,
      processed:
        importLog.imported_records +
        importLog.updated_records +
        importLog.error,
      imported: importLog.imported_records,
      updated: importLog.updated_records,
      errors: importLog.error,
      percentage:
        importLog.total_records > 0
          ? Math.round(
              ((importLog.imported_records +
                importLog.updated_records +
                importLog.error) /
                importLog.total_records) *
                100,
            )
          : 0,
      error_percentage: (importLog.error / importLog.total_records) * 100,
    };
  }

  return {
    status: progress.status,
    total: Number(progress.total),
    processed: Number(progress.processed),
    imported: Number(progress.imported),
    updated: Number(progress.updated),
    errors: Number(progress.error),
    percentage: Number(progress.percentage),
    error_percentage: (Number(progress.error) / Number(progress.total)) * 100,
  };
};

export const getImportLogsService = async ({ type }) => {
  const data = await ImportLog.findOne(
    { import_type: type },
    {
      filename: 1,
      total_records: 1,
      imported_records: 1,
      updated_records: 1,
      error: 1,
      status: 1,
    },
  ).sort({ createdAt: -1 });

  return data;
};

export const importControllerService = async ({type,req,userId}) => {
  const importLog = await ImportLog.create({
    filename: req?.file?.originalname,
    status: "pending",
    type: "CSV",
    import_type: type,
    total_records: 0,
    imported_records: 0,
    updated_records: -0,
    error: 0,
    user_id: userId,
  });

  await publishImportFile({
    importId: importLog._id.toString(),
    filePath: req.file?.path,
    fileName: req.file?.originalname,
    userId: userId,
  });

  return importLog
};

export const exportEventsDataService = async () => {
  const events = await Event.find()
    .select("title description date location ticketTypes category")
    .lean();

  const headers = [
    "title",
    "description",
    "date",
    "location",
    "ticketTypes",
    "category",
  ];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) {
      return '""';
    }

    const str =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = events.map((event) => [
    event.title,
    event.description,
    event.date ? new Date(event.date).toISOString() : "",
    event.location,
    JSON.stringify(event.ticketTypes ?? []),
    event.category?.toString() ?? "",
  ]);

  const csv = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  const date = new Date();

  const template = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="events_data_${template}.csv"`,
  );

  return csv;
};
