import cors from "cors";
import { globalErrorHandler } from "../Middleware/errorHandler.middleware.js";
import { authRouter } from "../Modules/Auth/auth.controller.js";
import { userRouter } from "../Modules/User/profile.controller.js";
import { messageRouter } from "../Modules/Messages/messages.controller.js";
import { replyRouter } from "../Modules/Reply/replies.controller.js";
import { reactionRouter } from "../Modules/Reactions/reaction.controller.js";
import { notificationRouter } from "../Modules/Notifications/notification.controller.js";
import { blockRouter } from "../Modules/Blocks/block.controller.js";
import { reportRouter } from "../Modules/Reports/report.controller.js";

export default function routerHandler(app, express, corsOptions) {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/Assets", express.static("Assets"));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/message", messageRouter);
  app.use("/api/v1/reply", replyRouter);
  app.use("/api/v1/reaction", reactionRouter);
  app.use("/api/v1/notification", notificationRouter);
  app.use("/api/v1/block", blockRouter);
  app.use("/api/v1/report", reportRouter);
  app.use(globalErrorHandler);
}
