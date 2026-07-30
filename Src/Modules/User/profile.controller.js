import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../../Middleware/auth.middleware.js";
import {
  getProfile,
  updatePassword,
  updateProfile,
  listUsers,
} from "./Services/profile.service.js";
import { SYSTEM_RULES } from "../../Constants/Constants.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";

export const userRouter = Router();
const { ADMIN, USER } = SYSTEM_RULES;

userRouter.get(
  "/list",
  authenticationMiddleware,
  authorizationMiddleware([ADMIN]),
  listUsers
);
userRouter.get("/profile", authenticationMiddleware, errorHandler(getProfile));
userRouter.patch(
  "/update/password",
  authenticationMiddleware,
  errorHandler(updatePassword)
);
userRouter.patch(
  "/update/profile",
  authenticationMiddleware,
  errorHandler(updateProfile)
);
