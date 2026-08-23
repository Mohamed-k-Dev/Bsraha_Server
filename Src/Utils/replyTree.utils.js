import Reply from "../DB/Models/Reply.model.js";

export async function getReplyDescendantIds(replyId) {
  const descendants = await Reply.aggregate([
    {
      $match: {
        _id: replyId,
      },
    },

    {
      $graphLookup: {
        from: "replies",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentReply",
        as: "descendants",
      },
    },

    {
      $project: {
        ids: {
          $concatArrays: [
            ["$_id"],
            "$descendants._id",
          ],
        },
      },
    },
  ]);

  if (!descendants.length) {
    return [];
  }

  return descendants[0].ids;
}