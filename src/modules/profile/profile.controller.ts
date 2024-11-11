import { NextFunction, Request, Response } from "express";
import ProfileService from "./profile.service";
import { Result } from "@core/utils";
import { IProfile } from "./profile.interface";
import { IUser } from "@modules/users";
import CreateProfileDTO from "./dtos/create_profile.dto";
import AddExperienceDTO from "./dtos/add_experience.dto";
import AddEducationDTO from "./dtos/add_education.dto";

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

  public createExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const experienceData: AddExperienceDTO = req.body;
      const profile: IProfile = await this.profileService.addExperience(
        userId,
        experienceData
      );
      res.status(200).json(new Result(profile));
    } catch (error) {
      next(error);
    }
  };

  public deleteExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const exp_id = req.params.exp_id;
      const profile: IProfile = await this.profileService.deleteExperience(
        req.user.id,
        exp_id
      );
      res.status(200).json(new Result(profile));
    } catch (error) {
      next(error);
    }
  };

  public createEducation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const educationData: AddEducationDTO = req.body;
      const profile: IProfile = await this.profileService.addEducation(
        userId,
        educationData
      );
      res.status(200).json(new Result(profile));
    } catch (error) {
      next(error);
    }
  };

  public deleteEducation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const edu_id = req.params.edu_id;
      const profile: IProfile = await this.profileService.deleteEducation(
        req.user.id,
        edu_id
      );
      res.status(200).json(new Result(profile));
    } catch (error) {
      next(error);
    }
  };

  public follow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromUser = req.user.id;
      const toUser = req.params.id;
      const followers = await this.profileService.follow(fromUser, toUser);
      res.status(200).json(new Result(followers));
    } catch (error) {
      next(error);
    }
  };

  public unfollow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromUser = req.user.id;
      const toUser = req.params.id;
      const followers = await this.profileService.unfollow(fromUser, toUser);
      res.status(200).json(new Result(followers));
    } catch (error) {
      next(error);
    }
  };
}
