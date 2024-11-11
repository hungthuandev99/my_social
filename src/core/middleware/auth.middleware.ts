import { Result } from "@core/utils";
import { DataStoredInToken } from "@modules/auth";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const token = authorization?.substring(7);

  try {
    const user = jwt.verify(
      token || "",
      process.env.JWT_TOKEN_SECRET!
    ) as DataStoredInToken;
    if (!req.user) req.user = { id: "" };
    req.user.id = user.id;
    next();
  } catch (error) {
    res.status(401).json(new Result(undefined, "Unauthorized Access"));
  }
};

export default authMiddleware;
