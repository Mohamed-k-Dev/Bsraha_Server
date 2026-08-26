import { Router } from "express";

import {
  createReplyReply,
  getReplyReplies,
  deleteReply,
} from "./Services/replies.service.js";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import {
  createReplySchema,
  deleteReplySchema,
  getRepliesSchema,
} from "../../validators/replies.schema.js";

export const replyRouter = Router();

replyRouter.post(
  "/to/:replyId",
  validationMiddleware(createReplySchema),
  authenticationMiddleware,
  errorHandler(createReplyReply)
);

replyRouter.get(
  "/:replyId/replies",
  validationMiddleware(getRepliesSchema),
  authenticationMiddleware,
  errorHandler(getReplyReplies)
);

replyRouter.delete(
  "/:replyId",
  validationMiddleware(deleteReplySchema),
  authenticationMiddleware,
  errorHandler(deleteReply)
);
