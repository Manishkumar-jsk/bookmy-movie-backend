import fs from "fs";
import csv from "csv-parser";
import ImportLog from "../models/import_log.model.js";
import Event from "../models/Event.js";
import Category from "../models/Category.js";
import redisClient from "../config/redis.js";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";

export const importDataFile = async ({
  importId,
  filePath,
  fileName,
  userId,
  importType
}) => {
  const progressKey = `import_events:${importId}:progress`;

  await ImportLog.findByIdAndUpdate(importId, {
    status: "processing",
    filename:fileName
  });

  try {
    const rows = [];
    const errorRows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", async (row) => {
          rows.push(row);
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    const totalRecords = rows?.length;

    await redisClient.hSet(progressKey, {
      status: "processing",
      total: totalRecords.toString(),
      processed: "0",
      imported: "0",
      updated: "0",
      error: "0",
      percentage: "0",
    });

    await redisClient.expire(progressKey, 60 * 60);

    let processedRecords = 0;
    let importedRecords = 0;
    let updatedRecords = 0;
    let errorRecords = 0;

    for (const row of rows) {
      try {
        const reasons = [];

        if (!row.title?.trim()) {
          reasons.push("Title is required");
        }

        if (!row.description?.trim()) {
          reasons.push("Description is required");
        }

        if (!row.date?.trim()) {
          reasons.push("Date is required");
        }

        if (!row.location?.trim()) {
          reasons.push("Location is required");
        }

        if (!row.category?.trim()) {
          reasons.push("Category is required");
        }

        if (!row.ticketTypes?.trim()) {
          reasons.push("Ticket types are required");
        }

        if (reasons.length > 0) {
          errorRows.push({
            ...row,
            reason: reasons.join("; "),
          });

          errorRecords++;
          continue;
        }

        const ticketTypes = JSON.parse(row.ticketTypes);

        const event = await Event.findOne({
          title: row.title,
        });

        const category = await Category.findOne({
          name:row.category
        })

        const eventData = {
          description: row.description,
          date: row.date,
          location: row.location,
          ticketTypes,
          createdBy: userId,
          category: category._id,
        };

        if (event) {
          await Event.findOneAndUpdate(
            { title: row.title },
            { $set: eventData },
            { runValidators: true },
          );

          updatedRecords++;
        } else {
          await Event.create({
            title: row.title,
            ...eventData,
          });

          importedRecords++;
        }
      } catch (error) {
        errorRows.push({
          ...row,
          reason: error?.message || "Unknown error",
        });

        errorRecords++;
      }

      processedRecords++;

      const percentage = Math.round((processedRecords / totalRecords) * 100);

      await redisClient.hSet(progressKey, {
        processed: processedRecords.toString(),
        imported: importedRecords.toString(),
        updated: updatedRecords.toString(),
        error: errorRecords.toString(),
        percentage: percentage.toString(),
      });
    }

    let errorFileName = null;
    if (errorRows.length > 0) {
      const logsDir = path.join(process.cwd(), "logs");

      await fs.promises.mkdir(logsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      errorFileName = `${fileName}_logs_${timestamp}.csv`;

      const headers = [
        ...Object.keys(rows[0] || {}).map((key) => ({
          id: key,
          title: key,
        })),
        {
          id: "reason",
          title: "reason",
        },
      ];

      const csvWriter = createObjectCsvWriter({
        path: path.join(logsDir, errorFileName),
        header: headers,
      });

      await csvWriter.writeRecords(errorRows);
    }

    await redisClient.hSet(progressKey, {
      status: "completed",
      processed: processedRecords.toString(),
      imported: importedRecords.toString(),
      updated: updatedRecords.toString(),
      error: errorRecords.toString(),
      percentage: "100",
    });

    await ImportLog.findByIdAndUpdate(importId, {
      status: "completed",
      total_records: totalRecords,
      imported_records: importedRecords,
      updated_records: updatedRecords,
      error: errorRecords,
      error_filename: errorFileName
    });
  } catch (error) {
    await redisClient.hSet(progressKey, {
      status: "failed",
      error: error.message,
    });

    await redisClient.expire(progressKey, 60 * 60);

    await ImportLog.findByIdAndUpdate(importId, {
      status: "failed",
    });

    throw error;
  }
};
