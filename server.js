import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import userRoutes from "./routes/user.routes.js"
import Error from "./middleware/error.middleware.js";
import logs from "./middleware/log.middleware.js";
import categoryRoutes from "./routes/category.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors(
  {origin:"http://localhost:3000",credentials:true}
));
app.use(express.json());
app.use(logs);

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/user",userRoutes);
app.use("/api/category",categoryRoutes)

app.use(Error)

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
