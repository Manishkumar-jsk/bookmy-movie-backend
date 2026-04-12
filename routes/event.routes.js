import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  eventsLocation,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getEvents);
router.post("/", auth, authorizeRoles("admin", "eventOwner"),upload.single("image"), createEvent);
router.put("/",auth,authorizeRoles("admin","eventOwner"),upload.single("image"),updateEvent);
router.get("/events-location",eventsLocation);
router.get("/:id", getEventById);
router.delete("/:id", auth, authorizeRoles("admin","eventOwner"), deleteEvent);

export default router;
