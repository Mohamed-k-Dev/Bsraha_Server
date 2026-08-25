import mongoose from "mongoose";
import {
  REACTION_TARGET_TYPES,
  REACTION_TYPES,
} from "../../Constants/Constants.js";

const ReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Reaction target is required"],
      refPath: "targetType",
    },

    targetType: {
      type: String,
      enum: Object.values(REACTION_TARGET_TYPES),
      required: [true, "Reaction target type is required"],
    },

    type: {
      type: String,
      enum: Object.values(REACTION_TYPES),
      required: [true, "Reaction type is required"],
    },
  },
  {
    timestamps: true,
  }
);

ReactionSchema.index(
  {
    user: 1,
    target: 1,
    targetType: 1,
  },
  {
    unique: true,
  }
);

ReactionSchema.index({
  target: 1,
  targetType: 1,
  type: 1,
});

const Reaction =
  mongoose.models.Reaction || mongoose.model("Reaction", ReactionSchema);

export default Reaction;
