import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blocker is required"],
    },

    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blocked user is required"],
    },
  },
  {
    timestamps: true,
  }
);

BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

BlockSchema.index({ blocker: 1, createdAt: -1 });

const Block = mongoose.models.Block || mongoose.model("Block", BlockSchema);

export default Block;
