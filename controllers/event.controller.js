//services
import {
  createEventService,
  deleteEventService,
  getEventsByIdService,
  getEventsService,
  updateEventService,
} from "../services/events.service.js";

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, ticketTypes, category } =
      req.body;

    console.log(req.file,"req file")

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

export const updateEvent = async (req,res,next) => {
  try {
    const { id,title, description, date, location, ticketTypes, category } =
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
    next(error)
  }
}

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
