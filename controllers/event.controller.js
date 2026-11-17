//services
import Event from "../models/Event.js";
import {
  createEventService,
  deleteEventService,
  exportEventsDataService,
  getEventsByIdService,
  getEventsService,
  getImportLogsService,
  getImportStatusService,
  importControllerService,
  updateEventService,
} from "../services/events.service.js";

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

export const importController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const { type } = req.body;
    const file = req?.file;
    const userId = req?.user.id;

    const importLog = await importControllerService({ type, req, userId });
    console.log(importLog,"log")

    return res.status(202).json({
      message: "Import started",
      importId: importLog._id,
    });
  } catch (error) {
    console.log(error, "error");
    return res.status(500).json({
      message: "Import failed",
    });
  }
};

export const getImportStatus = async (req, res) => {
  try {
    const { importId } = req.params;

    const data = await getImportStatusService({ importId });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get import status",
    });
  }
};

export const getImportLogs = async (req,res) => {
  try {
    const {type} = req.params;

    const data = await getImportLogsService({type});

    return res.status(200).json({success: true,data})
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get import logs",
    });
  }
}

export const exportEventsData = async (req,res) => {
  try {
    const csv = await exportEventsDataService()
    return res.status(200).send("\uFEFF" + csv);

  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Failed to get download data"
    })
  }
}
