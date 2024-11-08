import { HttpException } from "@core/exceptions";
import CreatePostDTO from "./dtos/create_post.dto";
import { IComment, ILike, IPost, IShare } from "./posts.interface";
import PostSchema from "./posts.model";
import { UserSchema } from "@modules/users";
import { IPagination } from "@core/interfaces";
import CreateCommentDTO from "./dtos/create_comment.dto";

export default class PostService {
  public postSchema = PostSchema;
  public userSchema = UserSchema;
  private selectField = ["first_name", "last_name", "avatar"];

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
    return post.populate("user", this.selectField);
  }

  public async updatePost(
    postId: string,
    postDTO: CreatePostDTO
  ): Promise<IPost> {
    const post = await this.postSchema
      .findByIdAndUpdate(postId, { ...postDTO }, { new: true })
      .populate([
        {
          path: "user",
          select: this.selectField,
        },
        {
          path: "likes",
          populate: { path: "user", select: this.selectField },
        },
        {
          path: "comments",
          populate: { path: "user", select: this.selectField },
        },
      ])
      .exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }
    return post;
  }

  public async getPostById(postId: string): Promise<IPost> {
    const post = await this.postSchema
      .findById(postId)
      .populate([
        {
          path: "user",
          select: this.selectField,
        },
        {
          path: "likes",
          populate: { path: "user", select: this.selectField },
        },
        {
          path: "comments",
          populate: { path: "user", select: this.selectField },
        },
      ])
      .exec();
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

    const posts = await this.postSchema
      .find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate([
        {
          path: "user",
          select: this.selectField,
        },
        {
          path: "likes",
          populate: { path: "user", select: this.selectField },
        },
        {
          path: "comments",
          populate: { path: "user", select: this.selectField },
        },
        {
          path: "shares",
          populate: { path: "user", select: this.selectField },
        },
      ])
      .exec();

    const rowCount = await this.postSchema.find(query).countDocuments().exec();

    return {
      total: rowCount,
      page: page,
      pageSize: pageSize,
      items: posts,
    };
  }

  public async deletePost(userId: string, postId: string): Promise<IPost> {
    const post = await this.postSchema
      .findById(postId)
      .populate([
        {
          path: "user",
          select: this.selectField,
        },
        {
          path: "likes",
          populate: { path: "user", select: this.selectField },
        },
        {
          path: "comments",
          populate: { path: "user", select: this.selectField },
        },
        {
          path: "shares",
          populate: { path: "user", select: this.selectField },
        },
      ])
      .exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }

    if (post.user.toString() !== userId) {
      throw new HttpException(400, "You are not authorized");
    }

    await post.deleteOne();
    return post;
  }

  public async likePost(userId: string, postId: string): Promise<ILike[]> {
    const post = await this.postSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }

    if (post.likes.some((like: ILike) => like.user.toString() === userId)) {
      post.likes = post.likes.filter(({ user }) => user.toString() !== userId);
    } else {
      post.likes.unshift({ user: userId });
    }

    await post.save();
    await post.populate({
      path: "likes",
      populate: { path: "user", select: this.selectField },
    });
    return post.likes;
  }

  public async createComment(
    userId: string,
    postId: string,
    comment: CreateCommentDTO
  ): Promise<IComment[]> {
    const post = await this.postSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(400, "This post is not found");
    }

    const newComment = {
      user: userId,
      text: comment.text,
    };

    post.comments.unshift(newComment as IComment);
    await post.save();
    await post.populate({
      path: "comments",
      populate: {
        path: "user",
        select: this.selectField,
      },
    });
    return post.comments;
  }

  public async deleteComment(
    userId: string,
    postId: String,
    commentId: string
  ): Promise<IComment[]> {
    const post = await this.postSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }

    const comment = await post.comments.find(
      (cmt) => cmt._id.toString() === commentId
    );
    if (!comment) {
      throw new HttpException(400, "Comment is not exist");
    }

    if (comment.user.toString() !== userId || post.user.toString() !== userId) {
      throw new HttpException(400, "You can not remove this comment");
    }

    post.comments = post.comments.filter(
      ({ _id }) => _id.toString() !== commentId
    );
    await post.save();
    await post.populate({
      path: "comments",
      populate: {
        path: "user",
        select: this.selectField,
      },
    });
    return post.comments;
  }

  public async sharePost(userId: string, postId: string): Promise<IShare[]> {
    const post = await this.postSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }

    if (
      post.shares &&
      post.shares.some((share: IShare) => share.user.toString() === userId)
    ) {
      throw new HttpException(400, "Post is already shared");
    }
    if (!post.shares) post.shares = [];
    post.shares.unshift({ user: userId });

    await post.save();
    await post.populate({
      path: "shares",
      populate: { path: "user", select: this.selectField },
    });
    return post.shares;
  }

  public async removeShared(userId: string, postId: string): Promise<IShare[]> {
    const post = await this.postSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(400, "Post is not found");
    }

    if (
      post.shares &&
      !post.shares.some((share: IShare) => share.user.toString() === userId)
    ) {
      throw new HttpException(400, "Post has not yet been shared");
    }
    if (!post.shares) post.shares = [];

    post.shares = post.shares.filter(
      (share: IShare) => share.user.toString() !== userId
    );

    await post.save();
    await post.populate({
      path: "shares",
      populate: { path: "user", select: this.selectField },
    });
    return post.shares;
  }
}
