import { NextFunction, Request, Response } from "express";
import PostService from "./posts.service";
import { Result } from "@core/utils";

export default class PostController {
  public postService = new PostService();
  public createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postData = req.body;
      const userId = req.user.id;
      const result = await this.postService.createPost(userId, postData);
      res.status(200).json(new Result(result));
    } catch (error) {
      next(error);
    }
  };

  public updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postData = req.body;
      const postId = req.params.id;
      const result = await this.postService.updatePost(postId, postData);
      res.status(200).json(new Result(result));
    } catch (error) {
      next(error);
    }
  };
}
