import { Router } from "express";


import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { reactToTarget, removeReaction } from "./Services/reaction.service.js";

export const reactionRouter = Router();

reactionRouter.post(
  "/:targetType/:targetId",
  authenticationMiddleware,
  errorHandler(reactToTarget)
);

reactionRouter.delete(
  "/:targetType/:targetId",
  authenticationMiddleware,
  errorHandler(removeReaction)
);