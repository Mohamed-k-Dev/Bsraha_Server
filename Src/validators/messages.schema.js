import Joi from "joi";
import { generalFieldsSchema } from "./generalFields.schema.js";

export const sendMessageSchema = {
  body: Joi.object({
    content: generalFieldsSchema.content,
    isAnonymous: generalFieldsSchema.isAnonymous,
  }),
  params: Joi.object({
    displayName: generalFieldsSchema.displayName,
  }),
};

export const getPublicMessagesSchema = {
  params: Joi.object({
    displayName: generalFieldsSchema.displayName,
  }),
};

export const publishMessageSchema = {
  params: Joi.object({
    messageId: generalFieldsSchema.mongoId,
  }),
};

export const updateVisibilitySchema = {
  params: Joi.object({
    messageId: generalFieldsSchema.mongoId,
  }),
  body: Joi.object({
    showReplies: generalFieldsSchema.showReplies,
  }),
};

export const deleteMessageSchema = {
  params: Joi.object({
    messageId: generalFieldsSchema.mongoId,
  }),
};

export const createReplySchema = {
  body: Joi.object({
    content: generalFieldsSchema.content,
    isAnonymous: generalFieldsSchema.isAnonymous,
  }),
  params: Joi.object({
    messageId: generalFieldsSchema.mongoId,
  }),
};

export const getRepliesSchema = {
  params: Joi.object({
    messageId: generalFieldsSchema.mongoId,
  }),
  query: Joi.object({
    page: generalFieldsSchema.page,
    limit: generalFieldsSchema.limit,
    skip: generalFieldsSchema.skip,
  }),
};
