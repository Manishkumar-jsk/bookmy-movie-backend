//services
import Event from "../models/Event.js";
import {
  createEventService,
  deleteEventService,
  getEventsByIdService,
  getEventsService,
  updateEventService,
} from "../services/events.service.js";
import ImportLog from "../models/import_log.model.js";
import { publishImportFile } from "../producers/import.producer.js";
import redisClient from "../config/redis.js";

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, ticketTypes, category } =
      req.body;

    const image = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";
    let parsedTicketTypes = JSON.parse(ticketTypes);

    await createEventService({
      title,
      description,
      date,
      location,
      userId: req.user.id,
      image,
      category,
      ticketTypes: parsedTicketTypes.map((ticket) => ({
        type: ticket.type,
        price: Number(ticket.price),
        totalSeats: Number(ticket.totalSeats),
      })),
    });

    res.status(201).json({
      success: true,
      message: "event created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id, title, description, date, location, ticketTypes, category } =
      req.body;

    const image = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    let parsedTicketTypes = JSON.parse(ticketTypes);

    await updateEventService({
      id,
      title,
      description,
      date,
      location,
      userId: req.user.id,
      image,
      category,
      ticketTypes: parsedTicketTypes.map((ticket) => ({
        type: ticket.type,
        price: Number(ticket.price),
        totalSeats: Number(ticket.totalSeats),
      })),
    });

    res.status(204).json({
      success: true,
      message: "Event updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const location = req?.query?.location;
    const events = await getEventsService(location);
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const event = await getEventsByIdService({ id });
    return res.status(200).json({ success: true, data: event || [] });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const id = req.params?.id;
    await deleteEventService({ id });
    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const eventsLocation = async (req, res, next) => {
  try {
    const locations = await Event.find({}).distinct("location");
    res.status(200).json({ success: true, locations });
  } catch (error) {
    next(error);
  }
};

export const importController = async (req,res,next) => {
  try {
    if(!req.file){
      return res.status(400).json({
        message:"CSV file is required"
      })
    }

    const {type} = req.body

    const importLog = await ImportLog.create({
      filename:req?.file?.originalname,
      status:"pending",
      type:"CSV",
      import_type:type,
      total_records:0,
      imported_records:0,
      updated_records:-0,
      error:0,
      user_id:req.user.id
    })

    await publishImportFile({
      importId:importLog._id.toString(),
      filePath:req.file.path,
      fileName:req.file.originalname,
      userId:req.user.id,
    })

    return res.status(202).json({
      message:"Import started",
      importId:importLog._id
    })

  } catch (error) {
    console.log(error,"error");
    return res.status(500).json({
      message:"Import failed"
    })
  }
}

export const getImportStatus = async (req, res) => {
  try {
    const { importId } = req.params;

    const progressKey = `import_events:${importId}:progress`;

    const progress = await redisClient.hGetAll(progressKey);

    if (Object.keys(progress).length === 0) {
      const importLog = await ImportLog.findById(importId).lean();

      if (!importLog) {
        return res.status(404).json({
          message: "Import not found",
        });
      }

      return res.status(200).json({
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
        error_percentage:(importLog.error / importLog.total_records) * 100
      });
    }

    return res.status(200).json({
      status: progress.status,
      total: Number(progress.total),
      processed: Number(progress.processed),
      imported: Number(progress.imported),
      updated: Number(progress.updated),
      errors: Number(progress.error),
      percentage: Number(progress.percentage),
      error_percentage:(Number(progress.error) / Number(progress.total)) * 100
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get import status",
    });
  }
};

export const getImportLogs = async (req,res) => {
  try {
    const {type} = req.params;

    const data = await ImportLog.findOne({import_type:type},{filename:1,total_records:1,imported_records:1,
      updated_records:1,error:1,status:1
    }).sort({createdAt:-1})

    return res.status(200).json({success: true,data})
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get import logs",
    });
  }
}

export const exportEventsData = async (req,res) => {
  try {
    const events = await Event.find().select("title description date location ticketTypes category").lean();

    console.log(events,"events")

    const headers = [
      "title",
      "description",
      "date",
      "location",
      "ticketTypes",
      "category"
    ]

    const escapeCSV = (value) => {
      if (value === null || value === undefined) {
        return '""';
      }

      const str =
        typeof value === "object"
          ? JSON.stringify(value)
          : String(value);

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

    const template = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}`

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="events_data_${template}.csv"`
    );

    return res.status(200).send("\uFEFF" + csv);

  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Failed to get download data"
    })
  }
}
