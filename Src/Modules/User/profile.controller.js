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
  uploadProfileImage,
  uploadProfileImages,
} from "./Services/profile.service.js";
import {
  ALLOWED_IMAGE_TYPES,
  SYSTEM_RULES,
} from "../../Constants/Constants.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import Multer from "../../Middleware/multer.middleware.js";

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



userRouter.patch(
  "/upload/profile-image",
  authenticationMiddleware,
  Multer(ALLOWED_IMAGE_TYPES).single("profileImage"),
  errorHandler(uploadProfileImage)
);

userRouter.patch(
  "/upload/coverImages",
  authenticationMiddleware,
  Multer(ALLOWED_IMAGE_TYPES).fields([
    { name: "coverImages", maxCount: 3 },
  ]),
  errorHandler(uploadProfileImages)
);
