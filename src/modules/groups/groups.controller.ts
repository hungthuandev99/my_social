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

  public updateGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const groupDTO = req.body;
      const updatedGroup = await this.groupService.updateGroup(
        groupId,
        groupDTO
      );
      res.status(200).json(new Result(updatedGroup));
    } catch (error) {
      next(error);
    }
  };

  public deleteGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;

      const deletedGroup = await this.groupService.deleteGroup(groupId);
      res.status(200).json(new Result(deletedGroup));
    } catch (error) {
      next(error);
    }
  };
}
