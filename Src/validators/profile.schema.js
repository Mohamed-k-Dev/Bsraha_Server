import Joi from "joi";
import { generalFieldsSchema } from "./generalFields.schema.js";

export const getPublicProfileSchema = {
  params: Joi.object({
    displayName: generalFieldsSchema.displayName,
  }),
  query: Joi.object({
    page: generalFieldsSchema.page,
    limit: generalFieldsSchema.limit,
    skip: generalFieldsSchema.skip,
  }),
};


export const searchUsersSchema = {
  query: Joi.object({
    q: generalFieldsSchema.q,
    page: generalFieldsSchema.page,
    limit: generalFieldsSchema.limit,
  }),
};