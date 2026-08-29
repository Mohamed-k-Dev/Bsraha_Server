import mongoose from "mongoose";
import {
  REPORT_TARGET_TYPES,
  REPORT_REASONS,
  REPORT_STATUS,
} from "../../Constants/Constants.js";

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
    },

    targetType: {
      type: String,
      enum: Object.values(REPORT_TARGET_TYPES),
      required: [true, "Target type is required"],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target id is required"],
    },

    reason: {
      type: String,
      enum: Object.values(REPORT_REASONS),
      required: [true, "Report reason is required"],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description must be at most 1000 characters"],
    },

    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index(
  {
    reporter: 1,
    targetType: 1,
    targetId: 1,
  },
  {
    unique: true,
  }
);

ReportSchema.index({
  targetType: 1,
  targetId: 1,
});

ReportSchema.index({
  status: 1,
  createdAt: -1,
});

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

export default Report;
