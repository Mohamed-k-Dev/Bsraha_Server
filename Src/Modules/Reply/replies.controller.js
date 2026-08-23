import { Router } from "express";

import {
  createReplyReply,
  getReplyReplies,
  deleteReply,
} from "./Services/replies.service.js";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";

export const replyRouter = Router();

replyRouter.post(
  "/to/:replyId",
  authenticationMiddleware,
  errorHandler(createReplyReply)
);

replyRouter.get("/:replyId/replies", errorHandler(getReplyReplies));

replyRouter.delete(
  "/:replyId",
  authenticationMiddleware,
  errorHandler(deleteReply)
);
