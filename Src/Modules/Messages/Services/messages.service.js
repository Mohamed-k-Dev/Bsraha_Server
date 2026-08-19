import Messages from "../../../DB/Models/Messages.model.js";
import User from "../../../DB/Models/User.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";

export async function getMyMessages(req, res, next) {
  const user = req.authUser;
  const sentMessages = await Messages.find({
    receiver: user._id,
    isDeleted: false,
  })
    .populate("sender", "_id userName displayName image")
    .lean();

  const messages = sentMessages.map((message) => {
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
  sendSuccessResponse({ res, data: { messages } });
}

export async function getPublicMessages(req, res, next) {
  const { displayName } = req.params;

  const user = await User.findOne({
    displayName,
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
    displayName: receiverUserName,
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
    receiver: user._id,
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
