import { Router } from "express";
import GroupController from "./groups.controller";
import { authMiddleware } from "@core/middleware";

export default class GroupRoute {
  public path = "/groups";
  public router = Router();
  public controller = new GroupController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, authMiddleware, this.controller.getAllGroup);
    this.router.post(this.path, authMiddleware, this.controller.createGroup);
  }
}
