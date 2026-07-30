import User from "../../../DB/Models/User.model.js";
import { hashSync, compareSync } from "bcrypt";
import { encrypt } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Service/sendEmail.service.js";
import { html } from "../../../Utils/html.utils.js";
import mailAttachmentsHandler from "../../../Utils/mailAttachments.utils.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";

export const signUp = async (req, res, next) => {
  const {
    userName,
    email,
    password,
    gender,
    phone,
    address,
    age,
    bio,
    birthDate,
    imageUrl,
  } = req.body;

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    return next(new Error("User already exist", { cause: 409 }));
  }

  const hashedPassword = hashSync(password, +process.env.SALT);
  const encryptedPhone =
    phone &&
    encrypt({
      plainText: phone,
      secretKey: process.env.PHONE_SECRET_KEY,
    });

  const generatedOtp = Math.floor(Math.random() * 1000000).toString();
  const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
  emitter.emit("sendMail", {
    to: email,
    subject: "Welcome to Sarahah",
    html: html({ userName, generatedOtp, operation: "verify your account" }),
    attachments: [
      mailAttachmentsHandler("Mohamed_Khaled_Backend.pdf"),
      mailAttachmentsHandler("Sarahah.md"),
      mailAttachmentsHandler("bank2.png"),
    ],
  });

  const user = await User.create({
    userName,
    email,
    password: hashedPassword,
    gender,
    phone: encryptedPhone,
    address,
    age,
    bio,
    birthDate,
    imageUrl,
    otp: generatedOtp,
    otpExpiration,
  });
  sendSuccessResponse({
    res,
    message: "User created successfully",
    status: 201,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("in-correct email or password", { cause: 404 }));
  }

  const isPasswordMatch = compareSync(password, user.password);
  if (!isPasswordMatch) {
    return next(new Error("in-correct email or password", { cause: 404 }));
  }

  if (!user.isVerified) {
    return next(new Error("Please verify your email", { cause: 403 }));
  }

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_KEY,
    { expiresIn: "1h", jwtid: uuidv4() }
  );
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: "7d", jwtid: uuidv4() }
  );

  sendSuccessResponse({
    res,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
};

export const verifyEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (user.otp !== otp) {
    return next(new Error("in-correct otp"));
  }
  if (user.otpExpiration < Date.now()) {
    return next(new Error("otp expired"));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiration = undefined;
  await user.save();

  sendSuccessResponse({
    res,
    message: "Email verified successfully",
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshtoken } = req.headers;

  const decoded = jwt.verify(refreshtoken, process.env.JWT_REFRESH_KEY);
  const isTokenBlacklisted = await BlackListedTokens.findOne({
    tokenId: decoded.jti,
  });
  if (isTokenBlacklisted) {
    return next(new Error("Token is blacklisted", { cause: 409 }));
  }

  const accessToken = jwt.sign(
    { id: decoded.id, email: decoded.email, role: decoded.role },
    process.env.JWT_ACCESS_KEY,
    { expiresIn: "1h", jwtid: uuidv4() }
  );

  sendSuccessResponse({
    res,
    data: { accessToken },
  });
};

export const logout = async (req, res, next) => {
  const { accesstoken, refreshtoken } = req.headers;

  const decodedAccess = jwt.verify(accesstoken, process.env.JWT_ACCESS_KEY);
  const decodedRefresh = jwt.verify(refreshtoken, process.env.JWT_REFRESH_KEY);

  const isTokenBlacklisted = await BlackListedTokens.findOne({
    tokenId: { $in: [decodedAccess.jti, decodedRefresh.jti] },
  });
  if (isTokenBlacklisted) {
    return next(new Error("Token is blacklisted", { cause: 409 }));
  }

  await BlackListedTokens.insertMany([
    {
      tokenId: decodedAccess.jti,
      expiredAt: decodedAccess.exp,
    },
    {
      tokenId: decodedRefresh.jti,
      expiredAt: decodedRefresh.exp,
    },
  ]);

  sendSuccessResponse({
    res,
    message: "User logged out successfully",
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const forgetOtp = Math.floor(Math.random() * 1000000).toString();
  const forgetOtpExpiration = new Date(Date.now() + 10 * 60 * 1000);
  const hashedForgetOtp = hashSync(forgetOtp, +process.env.SALT);

  user.forgetOtp = hashedForgetOtp;
  user.forgetOtpExpiration = forgetOtpExpiration;
  await user.save();
  emitter.emit("sendMail", {
    to: email,
    subject: "Welcome to Sarahah",
    html: html({
      userName: user.userName,
      generatedOtp: forgetOtp,
      operation: "forget password",
    }),
    attachments: [
      mailAttachmentsHandler("Mohamed_Khaled_Backend.pdf"),
      mailAttachmentsHandler("Sarahah.md"),
      mailAttachmentsHandler("bank2.png"),
    ],
  });

  sendSuccessResponse({
    res,
    message: "Otp sent successfully",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, password, confirmPassword, otp } = req.body;
  if (password !== confirmPassword) {
    return next(new Error("Passwords do not match"));
  }
  if (email !== req.authUser.email) {
    return next(new Error("in-correct login email"));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.forgetOtpExpiration < Date.now()) {
    return next(new Error("Otp expired"));
  }

  const isOtpValid = compareSync(otp, user.forgetOtp || "");
  if (!isOtpValid) {
    return next(new Error("in-correct otp"));
  }

  const hashedPassword = hashSync(password, +process.env.SALT);
  user.password = hashedPassword;
  user.forgetOtp = undefined;
  user.forgetOtpExpiration = undefined;
  await user.save();
  sendSuccessResponse({
    res,
    message: "Password updated successfully",
  });
};

// 274
// 253
