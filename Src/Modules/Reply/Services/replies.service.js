import Messages from "../../../DB/Models/Messages.model.js";
import Reply from "../../../DB/Models/Reply.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";
import getPagination from "../../../Utils/getPagination.utils.js";
import sanitizeSender from "../../../Utils/sanitizeSender.utils.js";

function buildReplyTree(replies) {
  const replyMap = new Map();
  const tree = [];

  for (const reply of replies) {
    replyMap.set(reply._id.toString(), {
      ...reply,
      replies: [],
    });
  }

  for (const reply of replyMap.values()) {
    if (!reply.parentReply) {
      tree.push(reply);
      continue;
    }

    const parent = replyMap.get(reply.parentReply.toString());

    if (parent) {
      parent.replies.push(reply);
    }
  }

  return tree;
}

async function findMessage(messageId) {
  return Messages.findOne({
    _id: messageId,
    isDeleted: false,
  });
}

async function findReply(replyId) {
  return Reply.findOne({
    _id: replyId,
    isDeleted: false,
  });
}

function canReplyToMessage(message, user) {
  if (message.isPublic) {
    return true;
  }

  return message.receiver.toString() === user._id.toString();
}

export async function createReplyReply(req, res, next) {
  const user = req.authUser;
  const { replyId } = req.params;
  const { content, isAnonymous } = req.body;

  const parentReply = await findReply(replyId);

  if (!parentReply) {
    return next(new Error("Reply not found", { cause: 404 }));
  }

  const message = await findMessage(parentReply.message);

  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  // if (!canReplyToMessage(message, user)) {
  //   return next(
  //     new Error("You are not allowed to reply to this conversation", {
  //       cause: 403,
  //     })
  //   );
  // }

  const reply = await Reply.create({
    message: message._id,
    parentReply: parentReply._id,
    sender: user._id,
    content,
    isAnonymous,
  });

  const populatedReply = await Reply.findById(reply._id).populate(
    "sender",
    "_id userName displayName image"
  );

  const responseReply = sanitizeSender(populatedReply);

  sendSuccessResponse({
    res,
    message: "Reply added successfully",
    data: {
      reply: responseReply,
    },
  });
}

export async function getReplyReplies(req, res, next) {
  const { replyId } = req.params;
  const { page, limit, skip } = getPagination(req.query);

  const parentReply = await findReply(replyId);

  if (!parentReply) {
    return next(new Error("Reply not found", { cause: 404 }));
  }

  const message = await findMessage(parentReply.message);

  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  // if (!message.isPublic) {
  //   const user = req.authUser;

  //   if (!user || message.receiver.toString() !== user._id.toString()) {
  //     return next(
  //       new Error("You are not allowed to view these replies", {
  //         cause: 403,
  //       })
  //     );
  //   }
  // }

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
    sender: user._id,
    isDeleted: false,
  });

  if (!reply) {
    return next(new Error("Reply not found", { cause: 404 }));
  }

  reply.isDeleted = true;
  reply.deletedAt = new Date();

  await reply.save();

  sendSuccessResponse({
    res,
    message: "Reply deleted successfully",
  });
}