import { Router } from "express";
import { bookEvent, getBookings } from "../controllers/booking.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", auth, bookEvent);
router.get("/", auth, getBookings);
export default router;
