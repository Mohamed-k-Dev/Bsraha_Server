import { Router } from "express";

import {
  getNotificationsSchema,
  markNotificationAsReadSchema,
  markNotificationsAsReadSchema,
} from "../../validators/notifications.schema.js";
import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationsAsRead,
} from "./Services/notification.service.js";

export const notificationRouter = Router();

notificationRouter.get(
  "/",
  validationMiddleware(getNotificationsSchema),
  authenticationMiddleware,
  errorHandler(getNotifications)
);

notificationRouter.patch(
  "/read",
  validationMiddleware(markNotificationsAsReadSchema),
  authenticationMiddleware,
  errorHandler(markNotificationsAsRead)
);

notificationRouter.patch(
  "/read-all",
  authenticationMiddleware,
  errorHandler(markAllNotificationsAsRead)
);

notificationRouter.patch(
  "/:notificationId/read",
  validationMiddleware(markNotificationAsReadSchema),
  authenticationMiddleware,
  errorHandler(markNotificationAsRead)
);

notificationRouter.delete(
  "/:notificationId",
  validationMiddleware(markNotificationAsReadSchema),
  authenticationMiddleware,
  errorHandler(deleteNotification)
);
