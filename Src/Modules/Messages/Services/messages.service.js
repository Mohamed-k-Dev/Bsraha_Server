import Messages from "../../../DB/Models/Messages.model.js";
import Reply from "../../../DB/Models/Reply.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";
import isActiveUser from "../../../Utils/isActiveUser.utils.js";
import getPagination from "../../../Utils/getPagination.utils.js";
import sanitizeSender from "../../../Utils/sanitizeSender.utils.js";
import {
  canReplyToMessage,
  canViewReplies,
} from "../../../Utils/replyPermissions.utils.js";
import { getMyReactionsMap } from "../../../Utils/getMyReaction.utils.js";
import {
  NOTIFICATION_TYPES,
  REACTION_TARGET_TYPES,
} from "../../../Constants/Constants.js";
import { formatReactionSummary } from "../../../Utils/formatReactionSummary.js";
import mongoose from "mongoose";
import createNotification from "../../../Utils/createNotification.utils.js";
import { areUsersBlocked } from "../../../Utils/areUsersBlocked.utils.js";

async function isValidMongoId(id) {
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch (error) {
    return false;
  }
}

export async function getMyMessages(req, res, next) {
  const user = req.authUser;

  const { page, limit = 10, skip } = getPagination(req.query);
  const { filter } = req.query;

  // Build MongoDB query dynamically based on selected filter tab
  const query = { receiver: user._id, isDeleted: false };

  if (filter === "public") query.isPublic = true;
  if (filter === "private") query.isPublic = false;
  if (filter === "anonymous") query.isAnonymous = true;
  if (filter === "identified") query.isAnonymous = false;

  // Fetch paginated data and total count concurrently
  const [messages, total] = await Promise.all([
    Messages.find(query)
      .populate("sender", "_id userName displayName image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Messages.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);
  const messageIds = messages.map((message) => message._id);

  // Fetch reactions and reply counts
  const myReactionsMap = await getMyReactionsMap({
    userId: user._id,
    targetIds: messageIds,
    targetType: REACTION_TARGET_TYPES.MESSAGE,
  });

  const repliesCount = await Reply.aggregate([
    { $match: { message: { $in: messageIds }, isDeleted: false } },
    { $group: { _id: "$message", count: { $sum: 1 } } },
  ]);
  const repliesCountMap = new Map(
    repliesCount.map((item) => [item._id.toString(), item.count])
  );

  // Format messages
  const formattedMessages = messages.map((message) => {
    const myReaction = myReactionsMap.get(message._id.toString()) || null;
    const formattedMessage = {
      ...message,
      reactions: formatReactionSummary(message.reactionSummary, myReaction),
      repliesCount: repliesCountMap.get(message._id.toString()) || 0,
    };
    return sanitizeSender(formattedMessage);
  });

  sendSuccessResponse({
    res,
    data: {
      messages: formattedMessages,
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
// 2. New Controller: Fetch Single Message by ID
export async function getSingleMessage(req, res, next) {
  const { messageId } = req.params;
  const user = req.authUser;

  const message = await Messages.findOne({ _id: messageId, isDeleted: false })
    .populate("sender", "_id userName displayName image")
    .lean();

  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  // Ensure user has permission to view this message
  if (
    message.receiver.toString() !== user._id.toString() &&
    !message.isPublic
  ) {
    return next(
      new Error("You do not have permission to view this message", {
        cause: 403,
      })
    );
  }

  const myReactionsMap = await getMyReactionsMap({
    userId: user._id,
    targetIds: [message._id],
    targetType: REACTION_TARGET_TYPES.MESSAGE,
  });

  const repliesCount = await Reply.countDocuments({
    message: message._id,
    isDeleted: false,
  });

  const formattedMessage = sanitizeSender({
    ...message,
    reactions: formatReactionSummary(
      message.reactionSummary,
      myReactionsMap.get(message._id.toString()) || null
    ),
    repliesCount,
  });

  sendSuccessResponse({
    res,
    data: { message: formattedMessage },
  });
}

export async function getPublicMessages(req, res, next) {
  const { displayName } = req.params;
  const loggedInUser = req.authUser;

  const user = await isActiveUser(displayName);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const blocked = await areUsersBlocked(loggedInUser._id, user._id);
  if (blocked) {
    return next(
      new Error("You cannot see a messages to this user", {
        cause: 403,
      })
    );
  }

  const messages = await Messages.find({
    receiver: user._id,
    isPublic: true,
    isDeleted: false,
  })
    .populate("sender", "_id userName displayName image")
    .sort({ publishedAt: -1 })
    .lean();
  const messageIds = messages.map((message) => message._id);
  const myReactionsMap = await getMyReactionsMap({
    userId: req.authUser._id,
    targetIds: messageIds,
    targetType: REACTION_TARGET_TYPES.MESSAGE,
  });
  console.log(myReactionsMap);

  const repliesCount = await Reply.aggregate([
    {
      $match: {
        message: {
          $in: messageIds,
        },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$message",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const repliesCountMap = new Map(
    repliesCount.map((item) => [item._id.toString(), item.count])
  );

  const formattedMessages = messages.map((message) => {
    const formattedMessage = {
      ...message,
      reactions: formatReactionSummary(
        message.reactionSummary,
        myReactionsMap.get(message._id.toString())
      ),
      repliesCount: repliesCountMap.get(message._id.toString()) || 0,
    };
    return sanitizeSender(formattedMessage);
  });

  sendSuccessResponse({
    res,
    data: {
      messages: formattedMessages,
    },
  });
}

export async function sendMessage(req, res, next) {
  const sender = req.authUser;
  const receiverUserName = req.params.displayName;
  const { content, isAnonymous } = req.body;

  const receiver = await isActiveUser(receiverUserName);
  if (!receiver) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (receiver._id.toString() === sender._id.toString()) {
    return next(
      new Error("You cannot send a message to yourself", {
        cause: 400,
      })
    );
  }

  const blocked = await areUsersBlocked(sender._id, receiver._id);
  if (blocked) {
    return next(
      new Error("You cannot send a message to this user", {
        cause: 403,
      })
    );
  }

  const message = await Messages.create({
    sender: sender._id,
    receiver: receiver._id,
    content,
    isAnonymous,
  });

  await createNotification({
    recipient: receiver._id,
    sender: isAnonymous ? "anonymous" : sender.displayName,
    type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
    message: `sent you a message`,
    messageId: message._id,
  });
  sendSuccessResponse({ res, data: { message } });
}

export async function publishMessage(req, res, next) {
  const user = req.authUser;
  const messageId = req.params.messageId;

  const message = await Messages.findOne({
    _id: messageId,
    isDeleted: false,
  });
  if (!message) {
    return next(new Error("message not found", { cause: 404 }));
  }

  if (message.receiver.toString() !== user._id.toString()) {
    return next(
      new Error("You are not allowed to publish this message", { cause: 403 })
    );
  }
  if (message.isPublic) {
    return next(new Error("This message is already published", { cause: 400 }));
  }

  const publishedMessage = await Messages.findOneAndUpdate(
    {
      _id: messageId,
      receiver: user._id,
      isDeleted: false,
    },
    {
      isPublic: true,
      publishedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  sendSuccessResponse({
    res,
    message: "Message published successfully",
    data: { publishedMessage },
  });
}

export async function unpublishMessage(req, res, next) {
  const user = req.authUser;
  const messageId = req.params.messageId;

  const message = await Messages.findById(messageId);
  if (!message) {
    return next(new Error("message not found", { cause: 404 }));
  }

  if (message.receiver.toString() !== user._id.toString()) {
    return next(
      new Error("You are not allowed to unpublish this message", { cause: 403 })
    );
  }

  if (!message.isPublic) {
    return next(
      new Error("This message is already unpublished", { cause: 400 })
    );
  }

  const unPublishedMessage = await Messages.findOneAndUpdate(
    {
      _id: messageId,
      receiver: user._id,
      isDeleted: false,
    },
    {
      isPublic: false,
      publishedAt: null,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  sendSuccessResponse({
    res,
    message: "Message unpublished successfully",
    data: { unPublishedMessage },
  });
}

export async function updateRepliesVisibility(req, res, next) {
  const user = req.authUser;
  const { messageId } = req.params;
  const { showReplies } = req.body;

  const message = await Messages.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  if (message.receiver.toString() !== user._id.toString()) {
    return next(
      new Error("You are not allowed to update replies visibility", {
        cause: 403,
      })
    );
  }

  const updatedMessage = await Messages.findByIdAndUpdate(
    { _id: messageId, isDeleted: false, receiver: user._id },
    {
      showReplies,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  sendSuccessResponse({
    res,
    message: "Replies visibility updated successfully",
    data: {
      message: updatedMessage,
    },
  });
}

export async function deleteMessage(req, res, next) {
  const user = req.authUser;
  const messageId = req.params.messageId;

  const message = await Messages.findOne({
    _id: messageId,
    receiver: user._id,
    isDeleted: false,
  });

  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  message.isDeleted = true;
  message.deletedAt = new Date();

  await message.save();

  sendSuccessResponse({
    res,
    message: "Message deleted successfully",
  });
}

export async function createMessageReply(req, res, next) {
  const user = req.authUser;
  const { messageId } = req.params;
  const { content, isAnonymous } = req.body;

  const message = await Messages.findOne({
    _id: messageId,
    isDeleted: false,
  });

  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  const blocked = await areUsersBlocked(user._id, message.receiver);
  if (blocked) {
    return next(
      new Error("You cannot send a message to this user", {
        cause: 403,
      })
    );
  }

  if (!canReplyToMessage(message, user._id)) {
    return next(
      new Error("You are not allowed to reply to this message", {
        cause: 403,
      })
    );
  }

  const reply = await Reply.create({
    message: message._id,
    parentReply: null,
    sender: user._id,
    content,
    isAnonymous,
  });

  await createNotification({
    recipient: message.receiver,
    sender: isAnonymous ? "anonymous" : user.displayName,
    type: NOTIFICATION_TYPES.REPLY_RECEIVED,
    message: `replied to your message: ${content}`,
    messageId: message._id,
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

export async function getMessageReplies(req, res, next) {
  const user = req.authUser;
  const { messageId } = req.params;
  const { page, limit = 10, skip } = getPagination(req.query);

  const message = await Messages.findOne({
    _id: messageId,
    isDeleted: false,
  });
  if (!message) {
    return next(new Error("Message not found", { cause: 404 }));
  }

  const blocked = await areUsersBlocked(user._id, message.sender);
  if (blocked) {
    return next(
      new Error("You cannot send a message to this user", {
        cause: 403,
      })
    );
  }

  if (!canViewReplies(message, user._id)) {
    return next(
      new Error("You are not allowed to view these replies", {
        cause: 403,
      })
    );
  }

  const filter = {
    message: message._id,
    parentReply: null,
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
  const replyIds = replies.map((reply) => reply._id);

  const myReactionsMap = await getMyReactionsMap({
    userId: user._id,
    targetIds: replyIds,
    targetType: REACTION_TARGET_TYPES.REPLY,
  });

  const formattedReplies = replies.map((reply) => ({
    ...sanitizeSender(reply),

    reactions: formatReactionSummary(
      reply.reactionSummary,
      myReactionsMap.get(reply._id.toString()) || null
    ),
  }));

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

export async function getUserStats(req, res, next) {
  const userId = req.authUser._id;

  // 1. Run independent counts concurrently
  const [totalMessagesReceived, publicMessages, sentMessages, userMessages] =
    await Promise.all([
      Messages.countDocuments({ receiver: userId, isDeleted: false }),
      Messages.countDocuments({
        receiver: userId,
        isPublic: true,
        isDeleted: false,
      }),
      Messages.countDocuments({ sender: userId, isDeleted: false }),
      // Fetch only _id and reactionSummary to minimize RAM usage
      Messages.find({ receiver: userId, isDeleted: false })
        .select("_id reactionSummary")
        .lean(),
    ]);

  const messageIds = userMessages.map((msg) => msg._id);

  // 2. Get total replies directed at this user's messages
  const totalReplies = await Reply.countDocuments({
    message: { $in: messageIds },
    isDeleted: false,
  });

  // 3. Calculate total reactions across all received messages
  let totalReactions = 0;
  userMessages.forEach((msg) => {
    if (msg.reactionSummary) {
      // Assuming reactionSummary is an object/map (e.g., { like: 5, love: 2 })
      Object.values(msg.reactionSummary).forEach((count) => {
        if (typeof count === "number") {
          totalReactions += count;
        }
      });
    }
  });

  sendSuccessResponse({
    res,
    message: "User statistics fetched successfully",
    data: {
      stats: {
        totalMessagesReceived,
        publicMessages,
        sentMessages,
        totalReplies,
        totalReactions,
      },
    },
  });
}
