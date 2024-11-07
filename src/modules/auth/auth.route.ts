import { Route } from "@core/interfaces";
import { Router } from "express";
import AuthController from "./auth.controller";
import { authMiddleware } from "@core/middleware";

export default class AuthRoute implements Route {
  public path = "/auth";
  public router = Router();

  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(this.path, this.authController.login);
    this.router.get(
      this.path,
      authMiddleware,
      this.authController.getCurrentLoginUser
    );
  }
}
