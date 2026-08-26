import Joi from "joi";
import { generalFieldsSchema } from "./generalFields.schema.js";

export const createReactionSchema = {
  body: Joi.object({
    type: generalFieldsSchema.type,
  }),
  params: Joi.object({
    targetType: generalFieldsSchema.targetType,
    targetId: generalFieldsSchema.mongoId,
  }),
};

export const removeReactionSchema = {
  params: Joi.object({
    targetType: generalFieldsSchema.targetType,
    targetId: generalFieldsSchema.mongoId,
  }),
};
