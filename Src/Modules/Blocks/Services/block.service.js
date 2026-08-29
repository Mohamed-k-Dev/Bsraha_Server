import Block from "../../../DB/Models/Block.model.js";
import User from "../../../DB/Models/User.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";

export async function blockUser(req, res, next) {
  const user = req.authUser;
  const { displayName } = req.params;

  const targetUser = await User.findOne({
    displayName: `${displayName}@Bsraha`,
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
  }).select("_id displayName userName image");

  if (!targetUser) {
    return next(
      new Error("User not found", {
        cause: 404,
      })
    );
  }

  if (targetUser._id.toString() === user._id.toString()) {
    return next(
      new Error("You cannot block yourself", {
        cause: 400,
      })
    );
  }

  const existingBlock = await Block.findOne({
    blocker: user._id,
    blocked: targetUser._id,
  });

  if (existingBlock) {
    return next(
      new Error("User is already blocked", {
        cause: 409,
      })
    );
  }

  const block = await Block.create({
    blocker: user._id,
    blocked: targetUser._id,
  });

  sendSuccessResponse({
    res,
    message: "User blocked successfully",
    data: {
      block,
    },
  });
}

export async function unblockUser(req, res, next) {
  const user = req.authUser;
  const { displayName } = req.params;

  const targetUser = await User.findOne({
    displayName : `${displayName}@Bsraha`,
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
  }).select("_id");

  if (!targetUser) {
    return next(
      new Error("User not found", {
        cause: 404,
      })
    );
  }

  const deletedBlock = await Block.findOneAndDelete({
    blocker: user._id,
    blocked: targetUser._id,
  });

  if (!deletedBlock) {
    return next(
      new Error("User is not blocked", {
        cause: 404,
      })
    );
  }

  sendSuccessResponse({
    res,
    message: "User unblocked successfully",
  });
}

export async function getBlockedUsers(req, res, next) {
  const user = req.authUser;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;
  const filter = {
    blocker: user._id,
  };

  const [blocks, total] = await Promise.all([
    Block.find(filter)
      .populate("blocked", "_id userName displayName image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Block.countDocuments(filter),
  ]);

  sendSuccessResponse({
    res,
    data: {
      blockedUsers: blocks.map((block) => block.blocked),

      pagination: {
        currentPage: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    },
  });
}
