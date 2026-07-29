import jwt from "jsonwebtoken";
import User from "../DB/Models/User.model.js";
import BlackListedTokens from "../DB/Models/blackListedTokens.model.js";
import { decrypt } from "../Utils/encryption.utils.js";

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

export const authenticationMiddleware = async (req, res, next) => {
  try {
    const { accesstoken } = req.headers;
    if (!accesstoken) {
      return res.status(401).json({ message: "access token required " });
    }

    const decoded = jwt.verify(accesstoken, process.env.JWT_ACCESS_KEY);
    console.log(decoded);
    const isTokenBlacklisted = await BlackListedTokens.findOne({
      tokenId: decoded.jti,
    });
    if (isTokenBlacklisted) {
      return res.status(401).json({ message: "please login again" });
    }

    const user = await User.findById(decoded.id, excludedFields);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // user.phone =
    //   user.phone &&
    //   JSON.parse(
    //     decrypt({
    //       cipherText: user.phone,
    //       secretKey: process.env.PHONE_SECRET_KEY,
    //     })
    //   );

    req.authUser = user;
    req.authUser.token = { tokenId: decoded.jti, expiredAt: decoded.exp };
    next();
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return res.status(401).json({ message: "Access token is expired" });
    } else if (error.name == "JsonWebTokenError") {
      return res.status(401).json({ message: "Access token is invalid" });
    }
    console.log(`Error in auth middleware: ${error.message}`);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const authorizationMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.authUser.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};
