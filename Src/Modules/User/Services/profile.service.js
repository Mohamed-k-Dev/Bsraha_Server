import User from "../../../DB/Models/User.model.js";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";
import { compareSync, hashSync } from "bcrypt";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";
import uploadImage, {
  deleteMultipleUploadedImages,
  deleteUploadedImage,
} from "../../../Service/cloudinary.service.js";
import Messages from "../../../DB/Models/Messages.model.js";
import { formatReactionSummary } from "../../../Utils/formatReactionSummary.js";

export const getProfile = async (req, res, next) => {
  const user = req.authUser;
  sendSuccessResponse({ res, data: { user } });
};

export const listUsers = async (req, res) => {
  const users = await User.find({});
  sendSuccessResponse({ res, data: { users } });
};

export const getPublicProfile = async (req, res, next) => {
  const { displayName } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findOne({
    displayName: `${displayName}@Bsraha`,
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
  })
    .select("_id displayName userName image bio")
    .lean();
  if (!user) {
    return next(
      new Error("User not found", {
        cause: 404,
      })
    );
  }

  const [messages, totalMessages] = await Promise.all([
    Messages.find({
      receiver: user._id,
      isPublic: true,
      isDeleted: false,
    })
      .populate("sender", "_id userName displayName image")
      .sort({
        publishedAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    Messages.countDocuments({
      receiver: user._id,
      isPublic: true,
      isDeleted: false,
    }),
  ]);
  const totalPages = Math.ceil(totalMessages / limit);

  const formattedMessages = messages.map((message) => {
    return {
      ...message,

      sender: message.isAnonymous
        ? {
            displayName: "Anonymous",
          }
        : message.sender
        ? {
            _id: message.sender._id,
            userName: message.sender.userName,
            displayName: message.sender.displayName,
            image: message.sender.image,
          }
        : null,

      reactions: formatReactionSummary(message.reactionSummary, null),
      showReplies: message.showReplies,
    };
  });

  sendSuccessResponse({
    res,
    data: {
      profile: {
        _id: user._id,
        userName: user.userName,
        displayName: user.displayName,
        image: user.image,
        bio: user.bio,
      },
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        totalPages,
        totalMessages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
};

export async function searchUsers(req, res, next) {
  const { q, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const filter = {
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
  };
  if (q?.trim()) {
    filter.displayName = {
      $regex: q.trim(),
      $options: "i",
    };
  }

  const [users, totalUsers] = await Promise.all([
    User.find(filter, "_id displayName userName image bio")
      .sort({ displayName: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    User.countDocuments(filter),
  ]);

  sendSuccessResponse({
    res,
    data: {
      users,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNextPage: page * limit < totalUsers,
        hasPreviousPage: page > 1,
      },
    },
  });
}

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return next(new Error("Passwords do not match"));
  }
  const user = await User.findById(req.authUser._id);

  const isPasswordMatch = compareSync(oldPassword, user.password);
  if (!isPasswordMatch) {
    return next(new Error("in-correct old password"));
  }

  const hashedPassword = hashSync(newPassword, +process.env.SALT);
  user.password = hashedPassword;
  await user.save();

  await BlackListedTokens.create({
    tokenId: req.authUser.token.tokenId,
    expiredAt: req.authUser.token.expiredAt,
  });
  sendSuccessResponse({ res, message: "Password updated successfully" });
};

export const updateProfile = async (req, res) => {
  const user = req.authUser;
  const { userName, gender, age, address, phone, birthDate } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      userName: userName || user.userName,
      gender: gender || user.gender,
      age: age || user.age,
      address: address || user.address,
      phone: phone || user.phone,
      birthDate: birthDate || user.birthDate,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  sendSuccessResponse({
    res,
    message: "Profile updated successfully",
    data: { user: updatedUser },
  });
};

export const uploadProfileImage = async (req, res) => {
  const user = req.authUser;
  const file = req.file;

  const hasImage = user.image && user.image.public_id;
  if (hasImage) {
    await deleteUploadedImage(user.image.public_id);
  }
  const cloudinary = await uploadImage({
    filePath: file.path,
    options: {
      folder: process.env.CLOUDINARY_PROFILE_FOLDER,
    },
  });

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { image: { url: cloudinary.secure_url, public_id: cloudinary.public_id } },
    { new: true }
  );
  res.json({
    message: "Profile image uploaded successfully",
    data: updatedUser,
  });
};

export const uploadProfileImages = async (req, res) => {
  const user = req.authUser;
  const { coverImages } = req.files;
  const hasImages = user.coverImages.length > 0;
  hasImages &&
    deleteMultipleUploadedImages(
      user.coverImages.map((image) => image.public_id)
    );
  const coverImageUrls = [];
  for (const image of coverImages) {
    const cloudinary = await uploadImage({
      filePath: image.path,
      options: {
        folder: process.env.CLOUDINARY_COVER_FOLDER,
      },
    });
    coverImageUrls.push({
      url: cloudinary.secure_url,
      public_id: cloudinary.public_id,
    });
  }
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { coverImages: coverImageUrls },
    { new: true }
  );
  res.json({
    message: "cover images uploaded successfully",
    data: updatedUser,
  });
};
