import rateLimit from "express-rate-limit";
import redisClient from "../config/redis.js";
import RedisStore from "rate-limit-redis";

let store;

if (redisClient.isOpen) {
  store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
}

export const eventRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },

  store,
});
