import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createOrderController,
  verifyPaymentController,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-order", auth, createOrderController);
router.post("/verify", auth, verifyPaymentController);

export default router;
