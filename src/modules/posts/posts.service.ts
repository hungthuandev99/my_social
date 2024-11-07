import { HttpException } from "@core/exceptions";
import CreatePostDTO from "./dtos/create_post.dto";
import { IPost } from "./posts.interface";
import PostSchema from "./posts.model";
import { UserSchema } from "@modules/users";

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
}
