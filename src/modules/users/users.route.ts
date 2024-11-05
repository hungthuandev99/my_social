import { Route } from "@core/interfaces";
import { Router } from "express";
import UsersController from "./users.controller";
import { authMiddleware, validationInputMiddleware } from "@core/middleware";
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
    this.router.get(
      this.path + "/:id",
      authMiddleware,
      this.userController.getUserById
    );
    this.router.put(
      this.path + "/:id",
      authMiddleware,
      validationInputMiddleware(RegisterDTO, true),
      this.userController.updateUser
    );
    this.router.get(this.path, authMiddleware, this.userController.getAllUser);
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.userController.deleteUser
    );
  }
}
