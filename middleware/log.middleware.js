import fs from "fs";
import path from "path";

const logFilePath = path.join("logs", "app.log");

const log = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) console.error("Log write error:", err);
    });
  });

  next();
};

export default log;
