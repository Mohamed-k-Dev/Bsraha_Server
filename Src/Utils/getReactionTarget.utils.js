import { REACTION_TARGET_TYPES } from "../Constants/Constants.js";
import Messages from "../DB/Models/Messages.model.js";
import Reply from "../DB/Models/Reply.model.js";

export default async function getReactionTarget({ targetId, targetType }) {
  if (targetType === REACTION_TARGET_TYPES.MESSAGE) {
    return Messages.findOne({
      _id: targetId,
      isDeleted: false,
    });
  }

  if (targetType === REACTION_TARGET_TYPES.REPLY) {
    return Reply.findOne({
      _id: targetId,
      isDeleted: false,
    });
  }

  return null;
}
