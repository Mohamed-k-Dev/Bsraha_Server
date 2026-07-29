import { Router } from "express";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import {
  getProfile,
  updatePassword,
  updateProfile,
  listUsers,
} from "./Services/profile.service.js";

export const userRouter = Router();

userRouter.get("/list", authenticationMiddleware, listUsers);
userRouter.get("/profile", authenticationMiddleware, getProfile);
userRouter.patch("/update/password", authenticationMiddleware, updatePassword);
userRouter.patch("/update/profile", authenticationMiddleware, updateProfile);
