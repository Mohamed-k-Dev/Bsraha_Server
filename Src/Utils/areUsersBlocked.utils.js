import Block from "../DB/Models/Block.model.js";

export async function areUsersBlocked(userA, userB) {
  const userAId = userA._id || userA;
  const userBId = userB._id || userB;

  const block = await Block.exists({
    $or: [
      {
        blocker: userAId,
        blocked: userBId,
      },
      {
        blocker: userBId,
        blocked: userAId,
      },
    ],
  });

  return Boolean(block);
}