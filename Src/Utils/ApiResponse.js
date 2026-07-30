export const sendSuccessResponse = ({
  res,
  message = "done",
  data = undefined,
  status = 200,
} = {}) => {
  res.status(status).json({ success: true, message, data });
};
