import cors from "cors";
import { globalErrorHandler } from "../Middleware/errorHandler.middleware.js";
import { authRouter } from "../Modules/Auth/auth.controller.js";
import { userRouter } from "../Modules/User/profile.controller.js";
import { messageRouter } from "../Modules/Messages/messages.controller.js";

export default function routerHandler(app, express, corsOptions) {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/Assets", express.static("Assets"));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/message", messageRouter);
  app.use(globalErrorHandler);
}
