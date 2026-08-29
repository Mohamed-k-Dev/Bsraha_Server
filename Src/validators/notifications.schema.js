import Joi from "joi";

export const getNotificationsSchema = {
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(20),

    isRead: Joi.boolean(),
  }),
};

export const markNotificationAsReadSchema = {
  params: Joi.object({
    notificationId: Joi.string()
      .hex()
      .length(24)
      .required(),
  }),
};

export const markNotificationsAsReadSchema = {
  body: Joi.object({
    notificationIds: Joi.array()
      .items(
        Joi.string()
          .hex()
          .length(24)
      )
      .min(1)
      .max(50)
      .required(),
  }),
};