export default function sanitizeSender(document) {
  const data = document?.toObject ? document.toObject() : { ...document };

  if (data.isAnonymous) {
    data.sender = {
      displayName: "Anonymous",
    };

    return data;
  }

  if (data.sender) {
    data.sender = {
      _id: data.sender._id,
      userName: data.sender.userName,
      displayName: data.sender.displayName,
      image: data.sender.image,
    };
  }

  return data;
}
