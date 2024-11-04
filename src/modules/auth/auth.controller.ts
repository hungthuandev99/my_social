import { NextFunction, Request, Response } from "express";
import { TokenData } from "@modules/auth";
import AuthSerivce from "./auth.service";
import LoginDTO from "./dtos/login.dto";
import Result from "@core/utils/result";

export default class AuthController {
  private authService = new AuthSerivce();
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: LoginDTO = req.body;
      const tokenData: TokenData = await this.authService.login(model);
      res.status(200).json(new Result(tokenData));
    } catch (error) {
      next(error);
    }
  };
  public getCurrentLoginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await this.authService.getCurrentLoginUser(req.user.id);
      res.status(200).json(new Result(user));
    } catch (error) {
      next(error);
    }
  };
}
