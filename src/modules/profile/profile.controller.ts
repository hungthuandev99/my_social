import { NextFunction, Request, Response } from "express";
import ProfileService from "./profile.service";
import { Result } from "@core/utils";
import { IProfile } from "./profile.interface";
import { IUser } from "@modules/users";
import CreateProfileDTO from "./dtos/create_profile.dto";

export default class ProfileController {
  private profileService = new ProfileService();
  public getCurrentProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const result: Partial<IUser> =
        await this.profileService.getCurrentProfile(userId);
      res.status(200).json(new Result(result));
    } catch (error) {
      next(error);
    }
  };

  public getProfileByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      const result: Partial<IUser> =
        await this.profileService.getCurrentProfile(userId);
      res.status(200).json(new Result(result));
    } catch (error) {
      next(error);
    }
  };

  public createProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const profileData: CreateProfileDTO = req.body;
      const userId = req.user.id;
      const createdProfile: IProfile = await this.profileService.createProfile(
        userId,
        profileData
      );
      res.status(200).json(new Result(createdProfile));
    } catch (error) {
      next(error);
    }
  };

  public deleteProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.profileService.deleteProfile(req.params.id);
      res.status(200).json(new Result(true));
    } catch (error) {
      next(error);
    }
  };
}
