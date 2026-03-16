import { Router } from "express";
import { bookEvent, getBookings } from "../controllers/booking.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const router = Router();

router.post("/", auth, authorizeRoles("user"), bookEvent);
router.get("/", auth, getBookings);
export default router;
