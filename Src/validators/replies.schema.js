import Joi from "joi";
import { generalFieldsSchema } from "./generalFields.schema.js";

export const createReplySchema = {
  body: Joi.object({
    content: generalFieldsSchema.content,
    isAnonymous: generalFieldsSchema.isAnonymous,
  }),
  params: Joi.object({
    replyId: generalFieldsSchema.mongoId,
  }),
};

export const getRepliesSchema = {
  params: Joi.object({
    replyId: generalFieldsSchema.mongoId,
  }),
  query: Joi.object({
    page: generalFieldsSchema.page,
    limit: generalFieldsSchema.limit,
    skip: generalFieldsSchema.skip,
  }),
};

export const deleteReplySchema = {
  params: Joi.object({
    replyId: generalFieldsSchema.mongoId,
  }),
};
