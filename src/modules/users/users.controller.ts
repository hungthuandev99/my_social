import { NextFunction, Request, Response } from "express";
import RegisterDTO from "./dtos/register.dto";
import UserService from "./users.service";
import { TokenData } from "@modules/auth";
import { Result } from "@core/utils";
import IUser from "./user.interface";

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
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.status(200).json(new Result(user));
    } catch (error) {
      next(error);
    }
  };
  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      const model: RegisterDTO = req.body;
      const updatedUser = await this.userService.updateUser(userId, model);
      res.status(200).json(new Result(updatedUser));
    } catch (error) {
      next(error);
    }
  };
}
