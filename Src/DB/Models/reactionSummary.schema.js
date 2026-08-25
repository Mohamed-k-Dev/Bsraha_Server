import mongoose from "mongoose";
import { REACTION_TYPES } from "../../Constants/Constants.js";

const reactionTypes = {};

for (const type of Object.values(REACTION_TYPES)) {
  reactionTypes[type] = {
    type: Number,
    default: 0,
    min: 0,
  };
}

export const ReactionSummarySchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    types: {
      type: reactionTypes,
      default: {},
    },
  },
  {
    _id: false,
  }
);
