import { NextFunction, Request, Response } from "express";
import RegisterDTO from "./dtos/register.dto";
import UserService from "./users.service";
import { TokenData } from "@modules/auth";
import { Result } from "@core/utils";

export default class UsersController {
  private userService = new UserService();
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: RegisterDTO = req.body;
      const tokenData: TokenData = await this.userService.createUser(model);
      res.status(201).json(new Result(tokenData));
    } catch (error) {
      next(error);
    }
  };
}
