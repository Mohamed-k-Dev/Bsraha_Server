import mongoose from "mongoose";
import { MESSAGE_STATUS } from "../../Constants/Constants.js";
import { encrypt } from "../../Utils/encryption.utils.js";
import decryptContent from "../../Utils/decryptContent.utils.js";
import { ReactionSummarySchema } from "./reactionSummary.schema.js";

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
    default: MESSAGE_STATUS.UNREAD,
  },
  reactionSummary: {
    type: ReactionSummarySchema,
    default: () => ({}),
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  showReplies: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const Messages =
  mongoose.models.Messages || mongoose.model("Messages", MessagesSchema);
export default Messages;
