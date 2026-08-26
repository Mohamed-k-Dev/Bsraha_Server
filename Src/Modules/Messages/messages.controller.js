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
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import {
  createReplySchema,
  deleteMessageSchema,
  getPublicMessagesSchema,
  getRepliesSchema,
  publishMessageSchema,
  sendMessageSchema,
  updateVisibilitySchema,
} from "../../validators/messages.schema.js";

export const messageRouter = Router();

messageRouter.get("/", authenticationMiddleware, errorHandler(getMyMessages));

messageRouter.get(
  "/public/:displayName",
  validationMiddleware(getPublicMessagesSchema),
  authenticationMiddleware,
  errorHandler(getPublicMessages)
);

messageRouter.post(
  "/send/to/:displayName",
  validationMiddleware(sendMessageSchema),
  authenticationMiddleware,
  errorHandler(sendMessage)
);

messageRouter.patch(
  "/publish/:messageId",
  validationMiddleware(publishMessageSchema),
  authenticationMiddleware,
  errorHandler(publishMessage)
);

messageRouter.patch(
  "/unPublish/:messageId",
  validationMiddleware(publishMessageSchema),
  authenticationMiddleware,
  errorHandler(unpublishMessage)
);

messageRouter.patch(
  "/:messageId/replies-visibility",
  validationMiddleware(updateVisibilitySchema),
  authenticationMiddleware,
  errorHandler(updateRepliesVisibility)
);

messageRouter.delete(
  "/delete/:messageId",
  validationMiddleware(deleteMessageSchema),
  authenticationMiddleware,
  errorHandler(deleteMessage)
);

messageRouter.post(
  "/:messageId/reply",
  validationMiddleware(createReplySchema),
  authenticationMiddleware,
  errorHandler(createMessageReply)
);

messageRouter.get(
  "/:messageId/replies",
  validationMiddleware(getRepliesSchema),
  authenticationMiddleware,
  errorHandler(getMessageReplies)
);
