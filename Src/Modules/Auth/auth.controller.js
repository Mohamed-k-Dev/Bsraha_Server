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
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/signup", errorHandler(signUp));
authRouter.post("/login", errorHandler(login));
authRouter.post("/verify-email", errorHandler(verifyEmail));
authRouter.post("/refresh-token", errorHandler(refreshToken));
authRouter.post("/logout", errorHandler(logout));
authRouter.patch("/forget-password", errorHandler(forgetPassword));
authRouter.patch(
  "/reset-password",
  authenticationMiddleware,
  errorHandler(resetPassword)
);
