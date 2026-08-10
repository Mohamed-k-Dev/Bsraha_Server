import User from "../DB/Models/User.model.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};
