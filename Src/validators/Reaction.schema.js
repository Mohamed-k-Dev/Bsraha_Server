import Joi from "joi";
import { generalFieldsSchema } from "./generalFields.schema.js";

export const createReactionSchema = Joi.object({
  body: {
    type: generalFieldsSchema.type,
  },
  params: {
    targetType: generalFieldsSchema.targetType,
    targetId: generalFieldsSchema.mongoId,
  },
});

export const removeReactionSchema = Joi.object({
  params: {
    targetType: generalFieldsSchema.targetType,
    targetId: generalFieldsSchema.mongoId,
  },
});
