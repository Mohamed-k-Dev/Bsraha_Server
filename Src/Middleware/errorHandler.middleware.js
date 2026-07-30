export const errorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.log(`Error middleware: ${err.message}`);
      return next(new Error(err, { cause: 500 }));
    });
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  console.log(`Error in global error handler middleware: ${err.message}`);
  res.status(err.cause || 400).json({
    success: false,
    message: err.message || "Internal server error from global error handler",
    stack: err.stack,
  });
};
