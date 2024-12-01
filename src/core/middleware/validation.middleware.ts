import { Request, Response, NextFunction, RequestHandler } from "express";
import { validate, ValidationError } from "class-validator";
import { ClassConstructor, plainToClass } from "class-transformer";
import { HttpException } from "@core/exceptions";

const validationInputMiddleware = (
  type: any,
  skipMissingProperty = false
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(plainToClass(type, req.body), {
      skipMissingProperties: skipMissingProperty,
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints!))
          .join(",");
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};

export default validationInputMiddleware;
