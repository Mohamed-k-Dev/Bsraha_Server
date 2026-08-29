import Joi from "joi";
import { REPORT_REASONS, REPORT_TARGET_TYPES } from "../Constants/Constants.js";

export const createReportSchema = {
  body: Joi.object({
    targetType: Joi.string()
      .valid(...Object.values(REPORT_TARGET_TYPES))
      .required(),

    targetId: Joi.string().hex().length(24).required(),

    reason: Joi.string()
      .valid(...Object.values(REPORT_REASONS))
      .required(),

    description: Joi.string().trim().max(1000).allow("").optional(),
  }),
};
