import mongoose from "mongoose";
import { MESSAGE_STATUS } from "../../Constants/Constants.js";

export const MessagesSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender is required"],
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Receiver is required"],
  },
  content: {
    type: String,
    required: [true, "Message is required"],
  },
  status: {
    type: String,
    enum: Object.values(MESSAGE_STATUS),
    default: MessagesSchema.UNREAD,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Messages =
  mongoose.models.Messages || mongoose.model("Messages", MessagesSchema);
export default Messages;
