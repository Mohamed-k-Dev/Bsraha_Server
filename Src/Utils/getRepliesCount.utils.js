import Reply from "../DB/Models/Reply.model.js";

export default async function getRepliesCount(messageId) {
  const result = await Reply.aggregate([
    {
      $match: {
        message: messageId,
        isDeleted: false,
      },
    },
    {
      $count: "count",
    },
  ]);

  return result[0]?.count || 0;
}
