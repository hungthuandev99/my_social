import { Route } from "@core/interfaces";
import { Router } from "express";
import ProfileController from "./profile.controller";
import { authMiddleware, validationInputMiddleware } from "@core/middleware";
import CreateProfileDTO from "./dtos/create_profile.dto";
import AddExperienceDTO from "./dtos/add_experience.dto";

export default class ProfileRoute implements Route {
  public path = "/api/profile";
  public router = Router();
  public controller = new ProfileController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      this.path + "/me",
      authMiddleware,
      this.controller.getCurrentProfile
    );
    this.router.get(
      this.path + "/user/:id",
      authMiddleware,
      this.controller.getProfileByUserId
    );
    this.router.post(
      this.path,
      authMiddleware,
      validationInputMiddleware(CreateProfileDTO),
      this.controller.createProfile
    );
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.controller.deleteProfile
    );

    this.router.put(
      this.path + "/experience",
      authMiddleware,
      validationInputMiddleware(AddExperienceDTO),
      this.controller.createExperience
    );

    this.router.delete(
      this.path + "/experience/:exp_id",
      authMiddleware,
      this.controller.deleteExperience
    );
  }
}
