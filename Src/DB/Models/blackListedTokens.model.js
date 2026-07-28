import mongoose from "mongoose";

const blackListedTokens = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: [true, "Token id is required"],
      unique: [true, "Token id already exists"],
    },
    expiredAt: { type: Date, required: [true, "Expired at is required"] },
  },
  { timestamps: true }
);

const BlackListedTokens =
  mongoose.models.BlackListedTokens ||
  mongoose.model("BlackListedTokens", blackListedTokens);
export default BlackListedTokens;
