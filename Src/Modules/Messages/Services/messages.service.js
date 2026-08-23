import Messages from "../../../DB/Models/Messages.model.js";
import Reply from "../../../DB/Models/Reply.model.js";
import User from "../../../DB/Models/User.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";
import getPagination from "../../../Utils/getPagination.utils.js";

function sanitizeSender(reply) {
  const data = reply.toObject ? reply.toObject() : reply;

  if (data.isAnonymous) {
    data.sender = {
      displayName: "Anonymous",
    };
  } else if (data.sender) {
    data.sender = {
      _id: data.sender._id,
      userName: data.sender.userName,
      displayName: data.sender.displayName,
      image: data.sender.image,
    };
  }

  return data;
}

export async function getMyMessages(req, res, next) {
  const user = req.authUser;

  const messages = await Messages.find({
    receiver: user._id,
    isDeleted: false,
  })
    .populate("sender", "_id userName displayName image")
    .sort({ createdAt: -1 })
    .lean();

  const messageIds = messages.map((message) => message._id);

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
      repliesCount: repliesCountMap.get(message._id.toString()) || 0,
    };

    if (message.isAnonymous) {
      formattedMessage.sender = {
        displayName: "Anonymous",
      };
    } else if (message.sender) {
      formattedMessage.sender = {
        _id: message.sender._id,
        userName: message.sender.userName,
        displayName: message.sender.displayName,
        image: message.sender.image,
      };
    }

    return formattedMessage;
  });

  sendSuccessResponse({
    res,
    data: {
      messages: formattedMessages,
    },
  });
}
// export async function getMyMessages(req, res, next) {
//   const user = req.authUser;
//   const sentMessages = await Messages.find({
//     receiver: user._id,
//     isDeleted: false,
//   })
//     .populate("sender", "_id userName displayName image")
//     .lean();

//   const messages = sentMessages.map((message) => {
//     if (message.isAnonymous) {
//       return {
//         ...message,
//         sender: {
//           displayName: "Anonymous",
//         },
//       };
//     }

//     return {
//       ...message,
//       sender: {
//         _id: message.sender._id,
//         userName: message.sender.userName,
//         displayName: message.sender.displayName,
//         image: message.sender.image,
//       },
//     };
//   });
//   sendSuccessResponse({ res, data: { messages } });
// }

export async function getPublicMessages(req, res, next) {
  const { displayName } = req.params;

  const user = await User.findOne({
    displayName: `${displayName}@Bsraha`,
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
  });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const messages = await Messages.find({
    receiver: user._id,
    isPublic: true,
    isDeleted: false,
  })
    .populate("sender", "_id userName displayName image")
    .sort({ publishedAt: -1 })
    .lean();

  const publicMessages = messages.map((message) => {
    if (message.isAnonymous) {
      return {
        ...message,
        sender: {
          displayName: "Anonymous",
        },
      };
    }

    return {
      ...message,
      sender: {
        _id: message.sender._id,
        userName: message.sender.userName,
        displayName: message.sender.displayName,
        image: message.sender.image,
      },
    };
  });

  sendSuccessResponse({
    res,
    data: {
      messages: publicMessages,
    },
  });
}

export async function sendMessage(req, res, next) {
  const sender = req.authUser;
  const receiverUserName = req.params.displayName;
  const { content, isAnonymous } = req.body;

  const user = await User.findOne({
    displayName: `${receiverUserName}@Bsraha`,
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const messages = await Messages.create({
    sender: sender._id,
    receiver: user._id,
    content,
    isAnonymous,
  });
  sendSuccessResponse({ res, data: { messages } });
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
      new Error("You are not allowed to unpublish this message", { cause: 403 })
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
      new Error("You are not allowed to publish this message", { cause: 403 })
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

// export async function createMessageReply(req, res, next) {
//   const user = req.authUser;
//   const { messageId } = req.params;
//   const { content, isAnonymous } = req.body;

//   const message = await Messages.findOne({
//     _id: messageId,
//     isDeleted: false,
//   });

//   if (!message) {
//     return next(new Error("Message not found", { cause: 404 }));
//   }

//   const reply = await Reply.create({
//     message: message._id,
//     parentReply: null,
//     sender: user._id,
//     content,
//     isAnonymous,
//   });

//   sendSuccessResponse({
//     res,
//     message: "Reply added successfully",
//     data: { reply },
//   });
// }

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

  if (
    (!message.isPublic &&
      message.receiver.toString() !== user._id.toString()) ||
    message.sender.toString() === user._id.toString()
  ) {
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

  const populatedReply = await Reply.findById(reply._id)
    .populate("sender", "_id userName displayName image")
    .select("-__v");

  const responseReply = populatedReply.toObject();

  if (responseReply.isAnonymous) {
    responseReply.sender = {
      displayName: "Anonymous",
    };
  }

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

  if (!message.isPublic) {
    if (message.receiver.toString() !== user._id.toString()) {
      return next(
        new Error("You are not allowed to view these replies", {
          cause: 403,
        })
      );
    }
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

export async function updateRepliesVisibility(req, res, next) {
  const user = req.authUser;
  const { messageId } = req.params;
  const { showReplies } = req.body;

  const message = await Messages.findById(messageId);

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
    messageId,
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
