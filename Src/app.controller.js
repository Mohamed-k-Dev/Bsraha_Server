import express from "express";
import path from "path";
import { config } from "dotenv";

import { connectDB } from "./DB/connection.js";
import routerHandler from "./Utils/routerHandler.utils.js";

config({ path: path.resolve("Src/Config/.dev.env") });

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.ORIGIN_WHITE_LIST || [];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin ${origin} is not allowed`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "refreshToken"],
};

routerHandler(app, express, corsOptions);

export default function bootstrapFunction() {
  connectDB();
  app
    .listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Please choose a different port.`
        );
      }
      console.error("Error starting server:", err);
    });
}
