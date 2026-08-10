import User from "../DB/Models/User.model.js";
import { verifyAccessToken } from "../Utils/token.js";
import { getAccessToken } from "../Utils/getAccessToken.js";
import { isTokenBlacklisted } from "../Utils/isTokenBlacklisted.js";
import { decryptPhone } from "../Utils/decryptPhone.js";
import { errorHandler } from "./errorHandler.middleware.js";

const excludedFields = {
  password: 0,
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
  isVerified: 0,
  otp: 0,
  otpExpiration: 0,
  forgetOtp: 0,
  forgetOtpExpiration: 0,
  isBlocked: 0,
  isDeleted: 0,
};

export const authenticationMiddleware = errorHandler(async (req, res, next) => {
  const accessToken = getAccessToken(req);

  const decoded = await verifyAccessToken(accessToken, next);
  const isAccessTokenBlacklisted = await isTokenBlacklisted(decoded.jti);
  if (isAccessTokenBlacklisted) {
    throw new Error("Access token is blacklisted", { cause: 401 });
  }

  const user = await User.findById(decoded.id, excludedFields);
  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }

  user.phone = decryptPhone(user.phone);
  req.authUser = user;
  req.authUser.token = { tokenId: decoded.jti, expiredAt: decoded.exp };
  next();
});

export const authorizationMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.authUser.role)) {
      return next(new Error("Forbidden", { cause: 403 }));
    }
    next();
  };
};
