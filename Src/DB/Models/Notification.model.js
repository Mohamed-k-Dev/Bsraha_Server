import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../../Constants/Constants.js";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },

    sender: {
      type: String,
      required: [true, "Sender is required"],
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, "Notification type is required"],
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxLength: [300, "Notification message is too long"],
    },

    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

NotificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;
