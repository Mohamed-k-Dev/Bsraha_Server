export default function sanitizeSender(reply) {
  const data = reply.toObject ? reply.toObject() : reply;

  if (data.isAnonymous) {
    data.sender = {
      displayName: "Anonymous",
    };
  } else if (data.sender) {
    data.sender = {
      _id: data.sender._id,
      userName: data.sender.userName,
      displayName: data.sender.displayName,
      image: data.sender.image,
    };
  }

  return data;
}
