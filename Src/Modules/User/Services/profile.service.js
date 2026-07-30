import User from "../../../DB/Models/User.model.js";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";
import { compareSync, hashSync } from "bcrypt";

export const listUsers = async (req, res) => {
  const users = await User.find({});
  res.json({ users });
};

export const getProfile = async (req, res, next) => {
  const user = req.authUser;
  res.json({ user });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return next(new Error("Passwords do not match"));
  }
  const user = await User.findById(req.authUser._id);

  const isPasswordMatch = compareSync(oldPassword, user.password);
  if (!isPasswordMatch) {
    return next(new Error("in-correct old password"));
  }

  const hashedPassword = hashSync(newPassword, +process.env.SALT);
  user.password = hashedPassword;
  await user.save();

  await BlackListedTokens.create({
    tokenId: req.authUser.token.tokenId,
    expiredAt: req.authUser.token.expiredAt,
  });
  res.json({ message: "Password updated successfully" });
};

export const updateProfile = async (req, res) => {
  const user = req.authUser;
  const { userName, gender, age, address, phone, birthDate } = req.body;

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
};
