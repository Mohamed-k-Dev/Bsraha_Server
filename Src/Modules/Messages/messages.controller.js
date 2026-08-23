import { Router } from "express";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import {
  createMessageReply,
  deleteMessage,
  getMessageReplies,
  getMyMessages,
  getPublicMessages,
  publishMessage,
  sendMessage,
  unpublishMessage,
  updateRepliesVisibility,
} from "./Services/messages.service.js";

export const messageRouter = Router();

messageRouter.get("/", authenticationMiddleware, errorHandler(getMyMessages));

messageRouter.get("/public/:displayName", errorHandler(getPublicMessages));

messageRouter.post(
  "/send/to/:displayName",
  authenticationMiddleware,
  errorHandler(sendMessage)
);

messageRouter.patch(
  "/publish/:messageId",
  authenticationMiddleware,
  errorHandler(publishMessage)
);

messageRouter.patch(
  "/unPublish/:messageId",
  authenticationMiddleware,
  errorHandler(unpublishMessage)
);

messageRouter.patch(
  "/:messageId/replies-visibility",
  authenticationMiddleware,
  errorHandler(updateRepliesVisibility)
);

messageRouter.delete(
  "/delete/:messageId",
  authenticationMiddleware,
  errorHandler(deleteMessage)
);

messageRouter.post(
  "/:messageId/reply",
  authenticationMiddleware,
  errorHandler(createMessageReply)
);

messageRouter.get(
  "/:messageId/replies",
  authenticationMiddleware,
  errorHandler(getMessageReplies)
);
