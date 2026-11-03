import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import userRoutes from "./routes/user.routes.js";
import Error from "./middleware/error.middleware.js";
import logs from "./middleware/log.middleware.js";
import categoryRoutes from "./routes/category.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import adminDashboardRoutes from "./routes/admin_dashboard.routes.js";
import notficationRoutes from "./routes/notification.routes.js";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use('/webhook',express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());
app.use(logs);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes,);
app.use("/api/booking",bookingRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin-dashboard",adminDashboardRoutes);
app.use("/api/notifications",notficationRoutes);
app.use("/", webhookRoutes);

app.use(Error);

export default app;