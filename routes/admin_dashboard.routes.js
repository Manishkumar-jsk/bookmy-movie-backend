import { Router } from "express";
import { getMetricsData, getTotalRevenue, getUpcomingEvents } from "../controllers/admin_dashboard.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

router.get('/revenue',auth,getTotalRevenue);
router.get('/metrics-data',auth,getMetricsData);
router.get('/upcoming-events',getUpcomingEvents)

export default router