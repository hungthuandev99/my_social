import { HttpException } from "@core/exceptions";
import CreatePostDTO from "./dtos/create_post.dto";
import { IPost } from "./posts.interface";
import PostSchema from "./posts.model";
import { UserSchema } from "@modules/users";
import { IPagination } from "@core/interfaces";

export default class PostService {
  public postSchema = PostSchema;
  public userSchema = UserSchema;

  public async createPost(
    userId: string,
    postDTO: CreatePostDTO
  ): Promise<IPost> {
    const user = await this.userSchema
      .findById(userId)
      .select("-password")
      .exec();
    if (!user) {
      throw new HttpException(400, "User is not exist");
    }
    const newPost = new PostSchema({
      text: postDTO.text,
      name: user.first_name + " " + user.last_name,
      avatar: user.avatar,
      user: userId,
    });

    const post = await newPost.save();
    return post;
  }

  public async updatePost(
    postId: string,
    postDTO: CreatePostDTO
  ): Promise<IPost> {
    const post = await this.postSchema
      .findByIdAndUpdate(postId, { ...postDTO }, { new: true })
      .exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }
    return post;
  }

  public async getPostById(postId: string): Promise<IPost> {
    const post = await this.postSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "This post is not found");
    }

    return post;
  }

  public async getAllPostFilter(
    page: number = 1,
    keyword?: string | undefined
  ): Promise<IPagination<IPost>> {
    const pageSize: number = Number(process.env.PAGE_SIZE || 10);
    let query = {};

    if (keyword) {
      query = { text: { $regex: `.*${keyword}.*` } };
    }

    const users = await this.postSchema
      .find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .exec();

    const rowCount = await this.postSchema.find(query).countDocuments().exec();

    return {
      total: rowCount,
      page: page,
      pageSize: pageSize,
      items: users,
    };
  }

  public async deletePost(userId: string, postId: string): Promise<IPost> {
    const post = await this.postSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }

    if (post.user.toString() !== userId) {
      throw new HttpException(400, "You are not authorized");
    }

    await post.deleteOne();
    return post;
  }
}
