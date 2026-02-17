//services
import {
  createEventService,
  deleteEventService,
  getEventsByIdService,
  getEventsService,
} from "../services/events.service.js";

export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      location,
      price,
      totalTickets,
      availableTickets,
      category,
    } = req.body;

    await createEventService({
      title,
      description,
      date,
      location,
      price,
      totalTickets,
      availableTickets,
      userId: req.user.id,
      category,
    });

    res.status(201).json({
      success: true,
      message: "event created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await getEventsService();
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const event = await getEventsByIdService({ id });
    res.status(200).json({ success: true, data: event });
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
