import express from "express";
import { config } from "dotenv";
import path from "path";
import { connectDB } from "./DB/connection.js";
import { authRouter } from "./Modules/Auth/auth.controller.js";
import { userRouter } from "./Modules/User/profile.controller.js";

config({ path: path.resolve("Src/Config/.dev.env") });
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

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
