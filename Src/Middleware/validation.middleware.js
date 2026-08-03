export const validationMiddleware = (schema = {}) => {
  return (req, res, next) => {
    const arrOfSchemas = Object.keys(schema);
    const validationErrors = [];

    for (const key of arrOfSchemas) {
      const { error } = schema[key]?.validate(req[key], { abortEarly: false });
      validationErrors.push(...error?.details || []);
    }

    if (validationErrors?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors?.map((err) => {
          return { message: err?.message, key: err?.context?.key };
        }),
      });
    }
    next();
  };
};
