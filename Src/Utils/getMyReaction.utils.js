import Reaction from "../DB/Models/Reaction.model.js";

export async function getMyReaction({ userId, targetId, targetType }) {
  const reaction = await Reaction.findOne({
    user: userId,
    target: targetId,
    targetType,
  })
    .select("type")
    .lean();

  return reaction?.type || null;
}

export async function getMyReactionsMap({ userId, targetIds, targetType }) {
  if (!targetIds.length) {
    return new Map();
  }

  const reactions = await Reaction.find({
    user: userId,
    target: {
      $in: targetIds,
    },
    targetType,
  })
    .select("target type")
    .lean();

  return new Map(
    reactions.map((reaction) => [reaction.target.toString(), reaction.type])
  );
}
