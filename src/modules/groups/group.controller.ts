import { Request, Response, NextFunction } from "express";
import GroupService from "./group.service";
import { Result } from "@core/utils";

export default class GroupController {
  public groupService = new GroupService();

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

  public getGroupById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const group = await this.groupService.getGroupById(groupId);
      res.status(200).json(new Result(group));
    } catch (error) {
      next(error);
    }
  };

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

  public updateGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const groupDTO = req.body;
      const updatedGroup = await this.groupService.updateGroup(
        req.user.id,
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

      const deletedGroup = await this.groupService.deleteGroup(
        req.user.id,
        groupId
      );
      res.status(200).json(new Result(deletedGroup));
    } catch (error) {
      next(error);
    }
  };

  public joinGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;

      const group = await this.groupService.joinGroup(userId, groupId);
      res.status(200).json(new Result(group));
    } catch (error) {
      next(error);
    }
  };

  public approveJoinRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.query.user_id as string;
      const groupId = req.query.group_id as string;
      const group = await this.groupService.approveJoinRequest(
        req.user.id,
        userId,
        groupId
      );
      res.status(200).json(new Result(group));
    } catch (error) {
      next(error);
    }
  };

  public addManager = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const addManagerDTO = req.body;
      const group = await this.groupService.addManager(
        req.user.id,
        addManagerDTO
      );
      res.status(200).json(new Result(group));
    } catch (error) {
      next(error);
    }
  };

  public deleteManager = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.query.user_id as string;
      const groupId = req.query.group_id as string;
      const group = await this.groupService.deleteManager(
        req.user.id,
        userId,
        groupId
      );
      res.status(200).json(new Result(group));
    } catch (error) {
      next(error);
    }
  };

  public getMemberList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const members = await this.groupService.getMemberList(groupId);
      res.status(200).json(new Result(members));
    } catch (error) {
      next(error);
    }
  };
}
