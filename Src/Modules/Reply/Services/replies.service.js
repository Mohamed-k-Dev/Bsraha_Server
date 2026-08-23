import Messages from "../../../DB/Models/Messages.model.js";
import Reply from "../../../DB/Models/Reply.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";
import getPagination from "../../../Utils/getPagination.utils.js";
import {
  canReplyToMessage,
  canViewReplies,
} from "../../../Utils/replyPermissions.utils.js";
import { getReplyDescendantIds } from "../../../Utils/replyTree.utils.js";
import sanitizeSender from "../../../Utils/sanitizeSender.utils.js";

export async function createReplyReply(req, res, next) {
  const user = req.authUser;
  const { replyId } = req.params;
  const { content, isAnonymous } = req.body;

  const parentReply = await Reply.findOne({
    _id: replyId,
    isDeleted: false,
  });
  if (!parentReply) {
    return next(new Error("Reply not found", { cause: 404 }));
  }

  const message = await Messages.findOne({
    _id: parentReply.message,
    isDeleted: false,
  });
  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  if (!canReplyToMessage(message, user._id)) {
    return next(
      new Error("You are not allowed to reply to this conversation", {
        cause: 403,
      })
    );
  }

  const reply = await Reply.create({
    message: message._id,
    parentReply: parentReply._id,
    sender: user._id,
    content,
    isAnonymous,
  });

  const responseReply = sanitizeSender(reply);

  sendSuccessResponse({
    res,
    message: "Reply added successfully",
    data: {
      reply: responseReply,
    },
  });
}

export async function getReplyReplies(req, res, next) {
  const user = req.authUser;
  const { replyId } = req.params;
  const { page, limit, skip } = getPagination(req.query);

  const parentReply = await Reply.findOne({
    _id: replyId,
    isDeleted: false,
  });
  if (!parentReply) {
    return next(new Error("Reply not found", { cause: 404 }));
  }

  const message = await Messages.findOne({
    _id: parentReply.message,
    isDeleted: false,
  });
  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  if (!canViewReplies(message, user._id)) {
    return next(
      new Error("You are not allowed to view replies to this conversation", {
        cause: 403,
      })
    );
  }

  const filter = {
    message: message._id,
    parentReply: parentReply._id,
    isDeleted: false,
  };

  const [replies, total] = await Promise.all([
    Reply.find(filter)
      .populate("sender", "_id userName displayName image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Reply.countDocuments(filter),
  ]);

  const formattedReplies = replies.map(sanitizeSender);

  const totalPages = Math.ceil(total / limit);

  sendSuccessResponse({
    res,
    data: {
      replies: formattedReplies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
}

export async function deleteReply(req, res, next) {
  const user = req.authUser;
  const { replyId } = req.params;

  const reply = await Reply.findOne({
    _id: replyId,
    isDeleted: false,
  });
  if (!reply) {
    return next(
      new Error("Reply not found", {
        cause: 404,
      })
    );
  }

  const message = await Messages.findOne({
    _id: reply.message,
    isDeleted: false,
  });

  const isReplyOwner = reply.sender.toString() === user._id.toString();
  const isMessageOwner = message.receiver.toString() === user._id.toString();
  if (!isReplyOwner && !isMessageOwner) {
    return next(
      new Error("You are not allowed to delete this reply", {
        cause: 403,
      })
    );
  }

  const replyIds = await getReplyDescendantIds(reply._id);

  await Reply.updateMany(
    {
      _id: {
        $in: replyIds,
      },
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    }
  );

  sendSuccessResponse({
    res,
    message: "Reply deleted successfully",
  });
}
