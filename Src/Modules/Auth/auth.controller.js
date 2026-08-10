import { Router } from "express";
import {
  forgetPassword,
  login,
  logout,
  refreshToken,
  resetPassword,
  signUp,
  verifyEmail,
  signInWithGmail,
  signUpWithGmail,
} from "./Services/auth.service.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import {
  forgetPasswordSchema,
  googleSchema,
  loginSchema,
  resetPasswordSchema,
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
  "/google/signup",
  validationMiddleware(googleSchema),
  errorHandler(signUpWithGmail)
);

authRouter.post(
  "/google/login",
  validationMiddleware(googleSchema),
  errorHandler(signInWithGmail)
);

authRouter.post(
  "/verify-email",
  validationMiddleware(verifyEmailSchema),
  errorHandler(verifyEmail)
);

authRouter.post("/refresh-token", errorHandler(refreshToken));

authRouter.post("/logout", errorHandler(logout));

authRouter.patch(
  "/forget-password",
  validationMiddleware(forgetPasswordSchema),
  errorHandler(forgetPassword)
);

authRouter.patch(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  errorHandler(resetPassword)
);
