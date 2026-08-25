export const SYSTEM_RULES = {
  USER: "user",
  ADMIN: "admin",
};

export const SYSTEM_PROVIDERS = {
  SYSTEM: "system",
  GOOGLE: "google",
};

export const MESSAGE_STATUS = {
  UNREAD: "unread",
  READ: "read",
  ARCHIVED: "archived",
  DELETED: "deleted",
};

export const EXCLUDED_FIELDS =
  "-password -__v -createdAt -updatedAt -isVerified -otp -otpExpiration -forgetOtp -forgetOtpExpiration -isBlocked -isDeleted";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const REACTION_TYPES = {
  HEART: "heart",
  LAUGH: "laugh",
  FIRE: "fire",
  SAD: "sad",
  ANGRY: "angry",
  WOW: "wow",
};

export const REACTION_TARGET_TYPES = {
  MESSAGE: "Messages",
  REPLY: "Reply",
};
