import { Router } from "express";
import { getProfile } from "./Services/profile.service.js";

export const userRouter = Router();

userRouter.get("/profile",getProfile);
