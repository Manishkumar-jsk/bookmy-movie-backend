import dotenv from "dotenv";
import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";
import http from "http";
import { getIo, initSocket } from "./socket/socket.js";
import app from "./app.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { consumeBookingEmail } from "./consumers/booking.consumer.js";
import { consumeImportFile } from "./consumers/import_file.consumer.js";

dotenv.config();
console.log("1️⃣ DB connecting...");
await connectDB();
console.log("1️⃣ DB connected...");

console.log("1️⃣ redis connecting...");
await redisClient.connect();
console.log("1️⃣ redis connected...");

console.log("1️⃣ rabbit connecting...");
await connectRabbitMQ();
console.log("1️⃣ rabbit connected...");
await consumeBookingEmail();
await consumeImportFile();

const server = http.createServer(app);
initSocket(server)


const PORT = process.env.PORT || 5000;


server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
