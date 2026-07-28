import jwt from "jsonwebtoken";
import User from "../../../DB/Models/User.model.js";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.authUser;
    res.json({ user });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid access token" });
    }
    console.log(`Error in get profile controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
