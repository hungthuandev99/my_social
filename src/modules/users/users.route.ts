import { Route } from "@core/interfaces";
import { Router } from "express";
import UsersController from "./users.controller";
import { validationInputMiddleware } from "@core/middleware";
import RegisterDTO from "./dtos/register.dto";

export default class UsersRoute implements Route {
  public path = "/api/users";
  public router = Router();

  public userController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      this.path,
      validationInputMiddleware(RegisterDTO, true),
      this.userController.register
    );
  }
}
