import { NextFunction, Request, Response } from "express";
import RegisterDTO from "./dtos/register.dto";
import UserService from "./user.service";
import { TokenData } from "@modules/auth";
import { Result } from "@core/utils";

export default class UserController {
  private userService = new UserService();
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: RegisterDTO = req.body;
      const tokenData: TokenData = await this.userService.createUser(model);
      const io = req.app.get("socketio");
      io.emit("user_created", `${model.email} has been registered`);
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
      const io = req.app.get("socketio");
      io.emit("user_updated", `${model.email} has been updated`);
      res.status(200).json(new Result(updatedUser));
    } catch (error) {
      next(error);
    }
  };

  public getAllUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = Number(req.query.page || 1);
      const keyword = req.query.keyword?.toString();
      const users = await this.userService.getAllUser(page, keyword);
      res.status(200).json(new Result(users));
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      const result = await this.userService.deleteUser(userId);
      const io = req.app.get("socketio");
      io.emit("user_deleted", `${result.email} has been deleted`);
      res.status(200).json(new Result(result));
    } catch (error) {
      next(error);
    }
  };
}
