import { Router } from "express";

import {
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "./Services/block.service.js";

import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";

import {
  blockUserSchema,
  unblockUserSchema,
  getBlockedUsersSchema,
} from "../../validators/blocks.schema.js";

export const blockRouter = Router();

blockRouter.post(
  "/:displayName",
  authenticationMiddleware,
  validationMiddleware(blockUserSchema),
  errorHandler(blockUser)
);

blockRouter.delete(
  "/:displayName",
  authenticationMiddleware,
  validationMiddleware(unblockUserSchema),
  errorHandler(unblockUser)
);

blockRouter.get(
  "/",
  authenticationMiddleware,
  validationMiddleware(getBlockedUsersSchema),
  errorHandler(getBlockedUsers)
);
