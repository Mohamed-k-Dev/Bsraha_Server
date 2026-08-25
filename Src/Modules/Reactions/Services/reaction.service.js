import {
  REACTION_TARGET_TYPES,
  REACTION_TYPES,
} from "../../../Constants/Constants.js";
import Reaction from "../../../DB/Models/Reaction.model.js";
import getReactionTarget from "../../../Utils/getReactionTarget.utils.js";
import updateReactionSummary from "../../../Utils/updateReactionSummary.utils.js";

export async function reactToTarget(req, res, next) {
  const user = req.authUser;
  const { targetType, targetId } = req.params;
  const { type } = req.body;

  if (!Object.values(REACTION_TARGET_TYPES).includes(targetType)) {
    return next(
      new Error("Invalid reaction to target type", {
        cause: 400,
      })
    );
  }

  if (!Object.values(REACTION_TYPES).includes(type)) {
    return next(
      new Error("Invalid reaction type", {
        cause: 400,
      })
    );
  }

  const target = await getReactionTarget({
    targetId,
    targetType,
  });
  if (!target) {
    return next(
      new Error("Target not found", {
        cause: 404,
      })
    );
  }

  const existingReaction = await Reaction.findOne({
    user: user._id,
    target: targetId,
    targetType,
  });

  if (existingReaction?.type === type) {
    return sendSuccessResponse({
      res,
      message: "Reaction already exists",
      data: {
        reaction: existingReaction,
        reactionSummary: target.reactionSummary,
      },
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Transaction
    |--------------------------------------------------------------------------
    */

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
      |--------------------------------------------------------------------------
      | No previous reaction
      |--------------------------------------------------------------------------
      */

    if (!existingReaction) {
      await Reaction.create(
        [
          {
            user: user._id,
            target: targetId,
            targetType,
            type,
          },
        ],
        {
          session,
        }
      );

      await updateReactionSummary({
        targetId,
        targetType,
        reactionType: type,
        totalIncrement: 1,
        typeIncrement: 1,
        session,
      });
    } else {
      /*
      |--------------------------------------------------------------------------
      | Change existing reaction
      |--------------------------------------------------------------------------
      */
      const oldType = existingReaction.type;

      await Reaction.updateOne(
        {
          _id: existingReaction._id,
        },
        {
          $set: {
            type,
          },
        },
        {
          session,
        }
      );

      await updateReactionSummary({
        targetId,
        targetType,
        reactionType: oldType,
        totalIncrement: 0,
        typeIncrement: -1,
        session,
      });

      await updateReactionSummary({
        targetId,
        targetType,
        reactionType: type,
        totalIncrement: 0,
        typeIncrement: 1,
        session,
      });
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  const updatedTarget = await getReactionTarget({
    targetId,
    targetType,
  });

  sendSuccessResponse({
    res,
    message: existingReaction
      ? "Reaction updated successfully"
      : "Reaction added successfully",
    data: {
      reactionSummary: updatedTarget.reactionSummary,
    },
  });
}
export async function removeReaction(req, res, next) {
  const user = req.authUser;

  const { targetType, targetId } = req.params;

  if (!Object.values(REACTION_TARGET_TYPES).includes(targetType)) {
    return next(
      new Error("Invalid reaction to target type", {
        cause: 400,
      })
    );
  }

  const target = await getReactionTarget({
    targetId,
    targetType,
  });

  if (!target) {
    return next(
      new Error("Target not found", {
        cause: 404,
      })
    );
  }

  const reaction = await Reaction.findOne({
    user: user._id,
    target: targetId,
    targetType,
  });

  if (!reaction) {
    return next(
      new Error("Reaction not found", {
        cause: 404,
      })
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await Reaction.deleteOne(
      {
        _id: reaction._id,
      },
      {
        session,
      }
    );

    await updateReactionSummary({
      targetId,
      targetType,
      reactionType: reaction.type,
      totalIncrement: -1,
      typeIncrement: -1,
      session,
    });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  sendSuccessResponse({
    res,
    message: "Reaction removed successfully",
  });
}
