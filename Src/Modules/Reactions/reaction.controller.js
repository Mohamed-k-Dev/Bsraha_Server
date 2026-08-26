import { Router } from "express";

import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { reactToTarget, removeReaction } from "./Services/reaction.service.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import {
  createReactionSchema,
  removeReactionSchema,
} from "../../validators/Reaction.schema.js";

export const reactionRouter = Router();

reactionRouter.post(
  "/:targetType/:targetId",
  validationMiddleware(createReactionSchema),
  authenticationMiddleware,
  errorHandler(reactToTarget)
);

reactionRouter.delete(
  "/:targetType/:targetId",
  validationMiddleware(removeReactionSchema),
  authenticationMiddleware,
  errorHandler(removeReaction)
);
