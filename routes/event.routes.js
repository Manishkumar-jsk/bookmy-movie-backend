import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
} from "../controllers/event.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", auth, authorizeRoles("admin", "eventOwner"),upload.single("image"), createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.delete("/:id", auth, authorizeRoles, deleteEvent);

export default router;
