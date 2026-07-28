import User from "../../../DB/Models/User.model.js";
import { hashSync, compareSync } from "bcrypt";
import { decrypt, encrypt } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Service/sendEmail.service.js";
import { html } from "../../../Utils/html.utils.js";
import mailAttachmentsHandler from "../../../Utils/mailAttachments.utils.js";
import jwt from "jsonwebtoken";

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
      { expiresIn: 20 }
    );
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" }
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
    const refreshToken = req.headers.authorization;
    if (!refreshToken) {
      return res.status(401).json({ message: "authorization required " });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: 20 }
    );

    res.json({ accessToken });
  } catch (error) {
    console.log(`Error in refresh token controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
