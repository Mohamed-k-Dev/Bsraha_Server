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
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import {
  loginSchema,
  refreshTokenSchema,
  signUpSchema,
  verifyEmailSchema,
} from "../../validators/auth.schema.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  validationMiddleware(signUpSchema),
  errorHandler(signUp)
);
authRouter.post(
  "/login",
  validationMiddleware(loginSchema),
  errorHandler(login)
);
authRouter.post(
  "/verify-email",
  validationMiddleware(verifyEmailSchema),
  errorHandler(verifyEmail)
);
authRouter.post(
  "/refresh-token",
  validationMiddleware(refreshTokenSchema),
  errorHandler(refreshToken)
);
authRouter.post("/logout", errorHandler(logout));
authRouter.patch("/forget-password", errorHandler(forgetPassword));
authRouter.patch(
  "/reset-password",
  authenticationMiddleware,
  errorHandler(resetPassword)
);
