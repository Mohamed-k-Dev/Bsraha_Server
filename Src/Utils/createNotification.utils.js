import Notification from "../DB/Models/Notification.model.js";

export default async function createNotification({
  recipient,
  sender,
  type,
  message,
  messageId,
}) {
  if (sender !== "anonymous") {
    sender = sender.replace("@Bsraha", "");
  }
  return Notification.create({
    recipient,
    sender,
    type,
    message,
    messageId,
  });
}
