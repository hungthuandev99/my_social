import { Request, Response, NextFunction } from "express";
import GroupService from "./groups.service";
import { Result } from "@core/utils";

export default class GroupController {
  public groupService = new GroupService();

  public createGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const groupDTO = req.body;
      const group = await this.groupService.createGroup(userId, groupDTO);
      res.status(200).json(new Result(group));
    } catch (error) {
      next(error);
    }
  };

  public getAllGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groups = await this.groupService.getAllGroup();
      res.status(200).json(new Result(groups));
    } catch (error) {
      next(error);
    }
  };
}
