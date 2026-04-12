import { Router } from "express";
import { razorpayWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/webhook", razorpayWebhook);

export default router;