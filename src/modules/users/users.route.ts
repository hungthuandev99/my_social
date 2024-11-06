import { Route } from "@core/interfaces";
import { Router } from "express";
import UsersController from "./users.controller";
import { authMiddleware, validationInputMiddleware } from "@core/middleware";
import RegisterDTO from "./dtos/register.dto";

export default class UsersRoute implements Route {
  public path = "/api/users";
  public router = Router();

  public controller = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      this.path,
      validationInputMiddleware(RegisterDTO, true),
      this.controller.register
    );
    this.router.get(
      this.path + "/:id",
      authMiddleware,
      this.controller.getUserById
    );
    this.router.put(
      this.path + "/:id",
      authMiddleware,
      validationInputMiddleware(RegisterDTO, true),
      this.controller.updateUser
    );
    this.router.get(this.path, authMiddleware, this.controller.getAllUser);
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.controller.deleteUser
    );
  }
}
