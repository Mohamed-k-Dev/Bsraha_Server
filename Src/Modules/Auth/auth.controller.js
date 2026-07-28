import { Router } from "express";
import {
  forgetPassword,
  login,
  logout,
  refreshToken,
  resetPassword,
  signUp,
  verifyEmail,
} from "./Services/auth.service.js";

export const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.patch("/forget-password", forgetPassword);
authRouter.patch("/reset-password", resetPassword);
