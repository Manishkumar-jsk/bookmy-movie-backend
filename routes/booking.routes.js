import {Router} from "express";
import { bookEvent } from "../controllers/booking.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();


router.post('/',auth,bookEvent);
export default router;