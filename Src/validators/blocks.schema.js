import Joi from "joi";
import { generalFieldsSchema } from "./generalFields.schema.js";

export const blockUserSchema = {
  params: Joi.object({
    displayName: generalFieldsSchema.displayName,
  }),
};

export const unblockUserSchema = {
  params: Joi.object({
    displayName: generalFieldsSchema.displayName,
  }),
};

export const getBlockedUsersSchema = {
  query: Joi.object({
    page: generalFieldsSchema.page,
    limit: generalFieldsSchema.limit,
  }),
};
