import { Route } from "@core/interfaces";
import { Router } from "express";
import PostController from "./posts.controller";
import { authMiddleware, validationInputMiddleware } from "@core/middleware";
import CreatePostDTO from "./dtos/create_post.dto";

export default class PostRoute implements Route {
  public path = "/posts";
  public router = Router();
  public controller = new PostController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      this.path,
      authMiddleware,
      validationInputMiddleware(CreatePostDTO, true),
      this.controller.createPost
    );
    this.router.put(
      this.path + "/:id",
      authMiddleware,
      validationInputMiddleware(CreatePostDTO),
      this.controller.updatePost
    );
  }
}
