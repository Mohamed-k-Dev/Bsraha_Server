import Joi from "joi";
import {
  REACTION_TARGET_TYPES,
  REACTION_TYPES,
} from "../Constants/Constants.js";

export const generalFieldsSchema = {
  displayName: Joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "Display name is required",
    "string.min": "Display name must be at least 3 characters",
    "string.max": "Display name must not exceed 30 characters",
    "any.required": "Display name is required",
  }),
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Message content is required",
    "string.min": "Message content cannot be empty",
    "string.max": "Message content must not exceed 1000 characters",
    "any.required": "Message content is required",
  }),
  isAnonymous: Joi.boolean().required().messages({
    "boolean.base": "isAnonymous must be a boolean",
    "any.required": "isAnonymous is required",
  }),
  mongoId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid ID format",
    "string.length": "Invalid ID length",
    "any.required": "ID is required",
  }),
  showReplies: Joi.boolean().required().messages({
    "boolean.base": "showReplies must be a boolean",
    "any.required": "showReplies is required",
  }),
  page: Joi.number().default(1),
  limit: Joi.number().default(10),
  skip: Joi.number().default(0),
  type: Joi.string().valid(...Object.values(REACTION_TYPES)).required().messages({
    "any.only": "Invalid reaction type",
    "any.required": "Reaction type is required",
    "string.empty": "Reaction type is required",
  }),
  targetType: Joi.string()
    .valid(...Object.values(REACTION_TARGET_TYPES))
    .required()
    .messages({
      "any.only": "Invalid reaction target type",
      "any.required": "Reaction target type is required",
    }),
};
