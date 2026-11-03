import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  eventsLocation,
  getEventById,
  getEvents,
  getImportLogs,
  getImportStatus,
  importController,
  updateEvent,
  exportEventsData
} from "../controllers/event.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { eventRateLimiter } from "../middleware/rateLimiter.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/",getEvents);
router.post("/", auth, authorizeRoles("admin", "eventOwner"),upload.single("image"), createEvent);
router.put("/",auth,authorizeRoles("admin","eventOwner"),upload.single("image"),updateEvent);
router.get("/download-events-data",auth,exportEventsData);
router.get("/events-location",eventsLocation);
router.get("/:id", eventRateLimiter,getEventById);
router.delete("/:id", auth, authorizeRoles("admin","eventOwner"), deleteEvent);
router.post("/import",auth,upload.single("file"),importController);
router.get("/import/:importId/status",getImportStatus);
router.get("/get-import-logs/:type",auth,getImportLogs);

export default router;