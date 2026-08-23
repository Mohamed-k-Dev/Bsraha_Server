export function isMessageParticipant(message, userId) {
  const id = userId.toString();
  return message.sender.toString() === id || message.receiver.toString() === id;
}

export function canViewReplies(message, userId) {
  if (isMessageParticipant(message, userId)) {
    return true;
  }
  return message.isPublic === true && message.showReplies === true;
}

export function canReplyToMessage(message, userId) {
  if (isMessageParticipant(message, userId)) {
    return true;
  }
  return message.isPublic === true && message.showReplies === true;
}

export function isMessageReceiver(message, userId) {
  return message.receiver.toString() === userId.toString();
}
