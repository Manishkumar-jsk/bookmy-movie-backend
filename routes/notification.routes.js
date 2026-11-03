import { Router } from "express";
import { getNotification, postReadNotification } from "../controllers/notification.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

router.get("/",auth,getNotification);
router.post("/read-notification",auth,postReadNotification);

export default router;