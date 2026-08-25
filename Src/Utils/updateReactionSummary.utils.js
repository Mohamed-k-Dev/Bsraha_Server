import { REACTION_TARGET_TYPES } from "../Constants/Constants.js";
import Messages from "../DB/Models/Messages.model.js";
import Reply from "../DB/Models/Reply.model.js";

export default async function updateReactionSummary({
  targetId,
  targetType,
  reactionType,
  totalIncrement,
  typeIncrement,
  session,
}) {
  const Model = targetType === REACTION_TARGET_TYPES.MESSAGE ? Messages : Reply;

  return Model.findOneAndUpdate(
    {
      _id: targetId,
      isDeleted: false,
    },
    {
      $inc: {
        "reactionSummary.total": totalIncrement,
        [`reactionSummary.types.${reactionType}`]: typeIncrement,
      },
    },
    {
      new: true,
      session,
    }
  );
}
