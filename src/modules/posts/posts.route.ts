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
    this.router.get(
      this.path,
      authMiddleware,
      this.controller.getAllPostFilter
    );
    this.router.get(
      this.path + "/:id",
      authMiddleware,
      this.controller.getPostById
    );
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
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.controller.deletePost
    );

    this.router.put(
      this.path + "/like/:id",
      authMiddleware,
      this.controller.likePost
    );

    this.router.put(
      this.path + "/comment/:id",
      authMiddleware,
      this.controller.createComment
    );

    this.router.delete(
      this.path + "/comment/:post_id/:comment_id",
      authMiddleware,
      this.controller.deleleComment
    );
  }
}
