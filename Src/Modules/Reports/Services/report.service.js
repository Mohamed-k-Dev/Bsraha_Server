import { REPORT_TARGET_TYPES } from "../../../Constants/Constants.js";
import Messages from "../../../DB/Models/Messages.model.js";
import Reply from "../../../DB/Models/Reply.model.js";
import Report from "../../../DB/Models/Report.model.js";
import User from "../../../DB/Models/User.model.js";
import { sendSuccessResponse } from "../../../Utils/ApiResponse.js";

async function validateReportTarget(targetType, targetId) {
  if (targetType === REPORT_TARGET_TYPES.USER) {
    return User.exists({
      _id: targetId,
      isDeleted: false,
    });
  }

  if (targetType === REPORT_TARGET_TYPES.MESSAGE) {
    return Messages.exists({
      _id: targetId,
      isDeleted: false,
    });
  }

  if (targetType === REPORT_TARGET_TYPES.REPLY) {
    return Reply.exists({
      _id: targetId,
      isDeleted: false,
    });
  }

  return false;
}
export async function createReport(req, res, next) {
  const user = req.authUser;

  const { targetType, targetId, reason, description } = req.body;

  if (targetId.toString() === user._id.toString()) {
    return next(
      new Error("You cannot report yourself", {
        cause: 400,
      })
    );
  }

  const targetExists = await validateReportTarget(targetType, targetId);

  if (!targetExists) {
    return next(
      new Error("Report target not found", {
        cause: 404,
      })
    );
  }

  const existingReport = await Report.findOne({
    reporter: user._id,
    targetType,
    targetId,
  });

  if (existingReport) {
    return next(
      new Error("You already reported this", {
        cause: 409,
      })
    );
  }

  const report = await Report.create({
    reporter: user._id,
    targetType,
    targetId,
    reason,
    description,
  });

  sendSuccessResponse({
    res,
    message: "Report submitted successfully",
    data: {
      report,
    },
  });
}
