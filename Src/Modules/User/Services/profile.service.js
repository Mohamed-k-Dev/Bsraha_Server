import jwt from "jsonwebtoken";
import User from "../../../DB/Models/User.model.js";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";
import { compareSync, hashSync } from "bcrypt";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (error) {
    console.log(`Error in get users controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const getProfile = async (req, res) => {
  try {
    const user = req.authUser;
    res.json({ user });
  } catch (error) {
    console.log(`Error in get profile controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findById(req.authUser._id);

    const isPasswordMatch = compareSync(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = hashSync(newPassword, +process.env.SALT);
    user.password = hashedPassword;
    await user.save();

    await BlackListedTokens.create({
      tokenId: req.authUser.token.tokenId,
      expiredAt: req.authUser.token.expiredAt,
    });
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(`Error in updating password controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.authUser;
    const { userName, gender, age, address, phone, birthDate  } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        userName: userName || user.userName,
        gender: gender || user.gender,
        age: age || user.age,
        address: address || user.address,
        phone: phone || user.phone,
        birthDate: birthDate || user.birthDate,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.log(`Error in updating profile controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
