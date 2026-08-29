import { Router } from "express";

import { createReport } from "./Services/report.service.js";

import { authenticationMiddleware } from "../../Middleware/auth.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";

import { createReportSchema } from "../../validators/reports.schema.js";

export const reportRouter = Router();

reportRouter.post(
  "/",
  authenticationMiddleware,
  validationMiddleware(createReportSchema),
  errorHandler(createReport)
);
