import User from "../../../DB/Models/User.model.js";
import { hashSync, compareSync } from "bcrypt";
import { encrypt } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Service/sendEmail.service.js";
import { html } from "../../../Utils/html.utils.js";
import mailAttachmentsHandler from "../../../Utils/mailAttachments.utils.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";

export const signUp = async (req, res) => {
  try {
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
      return res.status(400).json({ message: "User already exists" });
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
    res.status(201).json({
      message: "verify your email using the otp sent to your email",
      user,
    });
  } catch (error) {
    console.log(
      `Error in signUp controller: ${error.message} stack ${error.stack}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "in-correct email or password " });
    }

    const isPasswordMatch = compareSync(password, user.password);
    if (!isPasswordMatch) {
      return res.status(404).json({ message: "in-correct email or password " });
    }

    if (!user.isVerified) {
      return res.status(404).json({ message: "Email not verified" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "1h", jwtid: uuidv4() }
    );
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d", jwtid: uuidv4() }
    );

    res
      .status(200)
      .json({ message: "User login successfully", accessToken, refreshToken });
  } catch (error) {
    console.log(`Error in login controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(404).json({ message: "in-correct otp" });
    }
    if (user.otpExpiration < Date.now()) {
      return res.status(404).json({ message: "otp expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.log(`Error in verify Email controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = (req, res) => {
  try {
    const { refreshtoken } = req.headers;

    const decoded = jwt.verify(refreshtoken, process.env.JWT_REFRESH_KEY);
    const isTokenBlacklisted = BlackListedTokens.findOne({
      tokenId: decoded.jti,
    });
    if (isTokenBlacklisted) {
      return res.status(401).json({ message: "Refresh token is blacklisted" });
    }

    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  } catch (error) {
    console.log(`Error in refresh token controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const { accesstoken, refreshtoken } = req.headers;

    const decodedAccess = jwt.verify(accesstoken, process.env.JWT_ACCESS_KEY);
    const decodedRefresh = jwt.verify(
      refreshtoken,
      process.env.JWT_REFRESH_KEY
    );

    const isTokenBlacklisted = await BlackListedTokens.find({
      tokenId: { $in: [decodedAccess.jti, decodedRefresh.jti] },
    });
    if (isTokenBlacklisted) {
      return res
        .status(401)
        .json({ message: "Access token or refresh token is blacklisted" });
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

    res.status(200).json({ message: "User logout successfully" });
  } catch (error) {
    console.log(`Error in logout controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    res.status(200).json({ message: "Otp sent successfully" });
  } catch (error) {
    console.log(`Error in forget password controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword, otp } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.forgetOtpExpiration < Date.now()) {
      return res.status(404).json({ message: "otp expired" });
    }

    const isOtpValid = compareSync(otp, user.forgetOtp || "");
    if (!isOtpValid) {
      return res.status(404).json({ message: "Invalid otp" });
    }

    const hashedPassword = hashSync(password, +process.env.SALT);
    user.password = hashedPassword;
    user.forgetOtp = undefined;
    user.forgetOtpExpiration = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(`Error in reset password controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
