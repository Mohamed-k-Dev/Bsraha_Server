import Notification from "../../../DB/Models/Notification.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";

export async function getNotifications(req, res, next) {
  const user = req.authUser;

  const { page = 1, limit = 20, isRead } = req.query;

  const currentPage = Number(page);
  const pageLimit = Number(limit);
  const skip = (currentPage - 1) * pageLimit;

  const filter = {
    recipient: user._id,
  };
  if (typeof isRead !== "undefined") {
    filter.isRead = isRead;
  }

  const [notifications, totalNotifications, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate("sender", "_id userName displayName image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    Notification.countDocuments(filter),

    Notification.countDocuments({
      recipient: user._id,
      isRead: false,
    }),
  ]);

  sendSuccessResponse({
    res,
    data: {
      notifications,
      unreadCount,
      pagination: {
        currentPage,
        limit: pageLimit,
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / pageLimit),
        hasNextPage: currentPage * pageLimit < totalNotifications,
        hasPreviousPage: currentPage > 1,
      },
    },
  });
}

export async function markNotificationAsRead(req, res, next) {
  const user = req.authUser;
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: user._id,
  });

  if (!notification) {
    return next(
      new Error("Notification not found", {
        cause: 404,
      })
    );
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  sendSuccessResponse({
    res,
    message: "Notification marked as read",
    data: {
      notification,
    },
  });
}

export async function markNotificationsAsRead(req, res, next) {
  const user = req.authUser;
  const { notificationIds } = req.body;

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: user._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  sendSuccessResponse({
    res,
    message: "Notifications marked as read",
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
}

export async function markAllNotificationsAsRead(req, res, next) {
  const user = req.authUser;

  const result = await Notification.updateMany(
    {
      recipient: user._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  sendSuccessResponse({
    res,
    message: "All notifications marked as read",
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
}

export async function deleteNotification(req, res, next) {
  const user = req.authUser;
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: user._id,
  });

  if (!notification) {
    return next(
      new Error("Notification not found", {
        cause: 404,
      })
    );
  }

  sendSuccessResponse({
    res,
    message: "Notification deleted successfully",
  });
}
