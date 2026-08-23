import User from "../DB/Models/User.model.js";

export default async function isActiveUser(receiverUserName) {
  const user = await User.findOne({
    displayName: `${receiverUserName}@Bsraha`,
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
  });
  return user;
}
