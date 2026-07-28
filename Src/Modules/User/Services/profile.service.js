import jwt from "jsonwebtoken";
import User from "../../../DB/Models/User.model.js";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";

export const getProfile = async (req, res) => {
  try {
    const {accesstoken} = req.headers;
    if (!accesstoken) {
      return res.status(401).json({ message: "access token required " });
    }
    const decoded = jwt.verify(accesstoken , process.env.JWT_ACCESS_KEY);
    const isTokenBlacklisted = await BlackListedTokens.findOne({ tokenId: decoded.jti });
    if (isTokenBlacklisted) {
      return res.status(401).json({ message: "Access token is blacklisted" });
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid access token" });
    }
    console.log(`Error in get profile controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
