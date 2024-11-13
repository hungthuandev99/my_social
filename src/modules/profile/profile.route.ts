import { Route } from "@core/interfaces";
import { Router } from "express";
import ProfileController from "./profile.controller";
import { authMiddleware, validationInputMiddleware } from "@core/middleware";
import CreateProfileDTO from "./dtos/create_profile.dto";
import AddExperienceDTO from "./dtos/add_experience.dto";
import AddEducationDTO from "./dtos/add_education.dto";

export default class ProfileRoute implements Route {
  public path = "/profile";
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

    this.router.put(
      this.path + "/education",
      authMiddleware,
      validationInputMiddleware(AddEducationDTO),
      this.controller.createEducation
    );

    this.router.delete(
      this.path + "/education/:edu_id",
      authMiddleware,
      this.controller.deleteEducation
    );

    this.router.post(
      this.path + "/follow/:id",
      authMiddleware,
      this.controller.follow
    );

    this.router.post(
      this.path + "/unfollow/:id",
      authMiddleware,
      this.controller.unfollow
    );

    this.router.post(
      this.path + "/add_friend/:id",
      authMiddleware,
      this.controller.addFriend
    );

    this.router.post(
      this.path + "/unfriend/:id",
      authMiddleware,
      this.controller.unfriend
    );

    this.router.post(
      this.path + "/accept_friend/:id",
      authMiddleware,
      this.controller.acceptFriend
    );
  }
}
