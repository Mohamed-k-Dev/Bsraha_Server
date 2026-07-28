import { Router } from "express";
import { login, refreshToken, signUp, verifyEmail } from "./Services/auth.service.js";

export const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/refresh-token", refreshToken);
