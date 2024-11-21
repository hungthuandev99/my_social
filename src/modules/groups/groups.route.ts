import { Router } from "express";
import GroupController from "./groups.controller";
import { authMiddleware, validationInputMiddleware } from "@core/middleware";
import CreateGroupDTO from "./dtos/create_group.dto";

export default class GroupRoute {
  public path = "/groups";
  public router = Router();
  public controller = new GroupController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, authMiddleware, this.controller.getAllGroup);
    this.router.post(
      this.path,
      authMiddleware,
      validationInputMiddleware(CreateGroupDTO),
      this.controller.createGroup
    );

    this.router.put(
      this.path + "/:id",
      authMiddleware,
      validationInputMiddleware(CreateGroupDTO),
      this.controller.updateGroup
    );

    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.controller.deleteGroup
    );

    this.router.post(
      this.path + "/request/:id",
      authMiddleware,
      this.controller.joinGroup
    );
    this.router.post(
      this.path + "/approve",
      authMiddleware,
      this.controller.approveJoinRequest
    );
  }
}
