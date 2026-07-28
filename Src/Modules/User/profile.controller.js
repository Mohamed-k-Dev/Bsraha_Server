import { Router } from "express";
import { getProfile } from "./Services/profile.service.js";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";

export const userRouter = Router();

userRouter.get("/profile",authenticationMiddleware , getProfile);
