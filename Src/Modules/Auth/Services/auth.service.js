import User from "../../../DB/Models/User.model.js";
import { encrypt } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Service/sendEmail.service.js";
import { html } from "../../../Utils/html.utils.js";
import { mailAttachmentsHandler } from "../../../Utils/mailAttachments.utils.js";
import { v4 as uuidv4 } from "uuid";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";
import { OAuth2Client } from "google-auth-library";
import { SYSTEM_PROVIDERS } from "../../../Constants/Constants.js";
import { findUserByEmail } from "../../../Utils/findUser.js";
import { compareHashedData, hashData } from "../../../Utils/hash.js";
import { generateOtp } from "../../../Utils/otp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../Utils/token.js";

export const signUp = async (req, res, next) => {
  const data = req.body;

  const isUserExist = await findUserByEmail(data.email);
  if (isUserExist) {
    return next(new Error("User already exist", { cause: 409 }));
  }

  const hashedPassword = await hashData(data.password);
  const encryptedPhone =
    data.phone &&
    encrypt({
      plainText: data.phone,
      secretKey: process.env.PHONE_SECRET_KEY,
    });

  const { otp, otpExpiration, hashedOtp } = await generateOtp();
  emitter.emit("sendMail", {
    to: data.email,
    subject: "Welcome to Sarahah",
    html: html({
      userName: data.userName,
      otp,
      operation: "verify your account",
    }),
    attachments: [
      mailAttachmentsHandler("Mohamed_Khaled_Backend.pdf"),
      mailAttachmentsHandler("Sarahah.md"),
      mailAttachmentsHandler("bank2.png"),
    ],
  });

  await User.create({
    ...data,
    password: hashedPassword,
    phone: encryptedPhone,
    otp: hashedOtp,
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

  const user = await findUserByEmail(email);
  if (!user) {
    return next(new Error("in-correct email or password", { cause: 404 }));
  }

  const isPasswordMatch = await compareHashedData(password, user.password);
  if (!isPasswordMatch) {
    return next(new Error("in-correct email or password", { cause: 404 }));
  }

  if (!user.isVerified) {
    return next(new Error("Please verify your email", { cause: 403 }));
  }

  const accessToken = await generateAccessToken({
    data: { id: user._id, email: user.email, role: user.role },
  });
  const refreshToken = await generateRefreshToken({
    data: { id: user._id, email: user.email, role: user.role },
  });

  sendSuccessResponse({
    res,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
};

export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const { email_verified, email, name } = ticket.getPayload();

  if (!email_verified) {
    return next(new Error("Please verify your gmail account", { cause: 403 }));
  }

  const isUserExist = await findUserByEmail(email);
  if (isUserExist) {
    return next(new Error("User already exist", { cause: 409 }));
  }

  const payload = await User.create({
    email,
    userName: name,
        displayName: `${name}@Bsraha`,
    provider: SYSTEM_PROVIDERS.GOOGLE,
    isVerified: true,
    password: await hashData(uuidv4(), +process.env.SALT),
  });

  const accessToken = await generateAccessToken({
    data: { id: payload._id, email: payload.email, role: payload.role },
  });
  sendSuccessResponse({
    res,
    message: "User created successfully",
    data: { accessToken },
  });
};

export const signInWithGmail = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    return next(new Error("Please verify your gmail account", { cause: 403 }));
  }

  const user = await User.findOne({
    email: payload.email,
    provider: SYSTEM_PROVIDERS.GOOGLE,
  });
  if (!user) {
    return next(
      new Error("User not found, please sign up using google first", {
        cause: 404,
      })
    );
  }

  const accessToken = await generateAccessToken({
    data: { id: user._id, email: user.email, role: user.role },
  });
  const refreshToken = await generateRefreshToken({
    data: { id: user._id, email: user.email, role: user.role },
  });
  sendSuccessResponse({
    res,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
};

export const verifyEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const isOtpValid = await compareHashedData(otp, user.otp || "");
  if (!isOtpValid) {
    return next(new Error("in-correct otp"));
  }
  if (user.otpExpiration < Date.now()) {
    return next(new Error("otp expired"));
  }

  await User.findOneAndUpdate(
    { email },
    { isVerified: true, $unset: { otp: "", otpExpiration: "" } }
  );

  sendSuccessResponse({
    res,
    message: "Email verified successfully",
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshtoken } = req.headers;
  if (!refreshtoken) {
    return next(new Error("Please provide refresh token", { cause: 400 }));
  }

  const decoded = await verifyRefreshToken(refreshtoken);
  const isTokenBlacklisted = await BlackListedTokens.findOne({
    tokenId: decoded.jti,
  });
  if (isTokenBlacklisted) {
    return next(new Error("Token is blacklisted", { cause: 409 }));
  }

  const accessToken = await generateAccessToken({
    data: { id: decoded.id, email: decoded.email, role: decoded.role },
  });

  sendSuccessResponse({
    res,
    data: { accessToken },
  });
};

export const logout = async (req, res, next) => {
  const { accesstoken, refreshtoken } = req.headers;
  if (!accesstoken || !refreshtoken) {
    return next(
      new Error("Please provide access and refresh token", { cause: 400 })
    );
  }

  const decodedAccess = await verifyAccessToken(accesstoken);
  const decodedRefresh = await verifyRefreshToken(refreshtoken);

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
  const user = await findUserByEmail(email);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const {
    otp: forgetOtp,
    otpExpiration: forgetOtpExpiration,
    hashedOtp: hashedForgetOtp,
  } = await generateOtp();

  await User.findOneAndUpdate(
    { email },
    { forgetOtp: hashedForgetOtp, forgetOtpExpiration }
  );
  emitter.emit("sendMail", {
    to: email,
    subject: "Welcome to Sarahah",
    html: html({
      userName: user.userName,
      otp: forgetOtp,
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
  const { email, password, otp } = req.body;
  const user = await findUserByEmail(email);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const isOtpValid = await compareHashedData(otp, user.forgetOtp || "");
  if (!isOtpValid) {
    return next(new Error("in-correct otp"));
  }
  if (user.forgetOtpExpiration < Date.now()) {
    return next(new Error("Otp expired"));
  }

  const hashedPassword = await hashData(password);
  await User.findOneAndUpdate(
    { email },
    {
      password: hashedPassword,
      $unset: { forgetOtp: "", forgetOtpExpiration: "" },
    }
  );
  sendSuccessResponse({
    res,
    message: "Password updated successfully",
  });
};




