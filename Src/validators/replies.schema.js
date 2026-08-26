import Joi from "joi";

export const createReplySchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Reply content is required",
    "string.min": "Reply content cannot be empty",
    "string.max": "Reply content must not exceed 1000 characters",
    "any.required": "Reply content is required",
  }),

  isAnonymous: Joi.boolean().required().messages({
    "boolean.base": "isAnonymous must be a boolean",
    "any.required": "isAnonymous is required",
  }),
});

export const replyParamsSchema = Joi.object({
  replyId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid reply ID",
    "string.length": "Invalid reply ID",
    "any.required": "Reply ID is required",
  }),
});

export const replyMessageParamsSchema = Joi.object({
  messageId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid message ID",
    "string.length": "Invalid message ID",
    "any.required": "Message ID is required",
  }),
});
