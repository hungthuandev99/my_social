import { HttpException } from "@core/exceptions";
import { Logger, Result } from "@core/utils";
import { Request, Response, NextFunction } from "express";

const errorHandleMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status: number = error.status || 500;
  const message: string = error.message || "Some thing when wrong";
  Logger.error(`[ERROR] - Status: ${status} - Msg: ${message}`);
  res.status(status).json(new Result(undefined, message));
};

export default errorHandleMiddleware;
