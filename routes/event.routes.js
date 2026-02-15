import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
} from "../controllers/event.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", auth, createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.delete("/:id", deleteEvent);

export default router;
