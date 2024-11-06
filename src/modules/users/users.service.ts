import { DataStoredInToken, TokenData } from "@modules/auth";
import UserSchema from "./user.model";
import RegisterDTO from "./dtos/register.dto";
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";
import IUser from "./user.interface";
import jwt from "jsonwebtoken";
import { IPagination } from "@core/interfaces";

class UserService {
  public userSchema = UserSchema;

  public async createUser(model: RegisterDTO): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findOne({ email: model.email }).exec();
    if (user) {
      throw new HttpException(409, `Your email ${model.email} already exist.`);
    }

    const avatar = gravatar.url(model.email!, {
      size: "200",
      rating: "g",
      default: "mm",
    });

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(model.password!, salt);
    const createdUser: IUser = await this.userSchema.create({
      ...model,
      password: hashedPassword,
      avatar: avatar,
      date: Date.now(),
    });
    return this.createToken(createdUser);
  }

  public async getUserById(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(404, "User is not exist");
    }

    return user;
  }

  public async updateUser(userId: string, model: RegisterDTO): Promise<IUser> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(400, `User is not exist.`);
    }

    const existUsers = await this.userSchema
      .find({
        $and: [
          { email: { $eq: model.email } },
          {
            _id: { $ne: userId },
          },
        ],
      })
      .exec();

    if (existUsers.length !== 0) {
      throw new HttpException(400, "Your email has been used by another user");
    }

    let updatedUser;
    if (model.password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(model.password!, salt);
      updatedUser = await this.userSchema
        .findByIdAndUpdate(
          userId,
          {
            ...model,
            password: hashedPassword,
          },
          { new: true }
        )
        .exec();
    } else {
      updatedUser = await this.userSchema
        .findByIdAndUpdate(userId, model, { new: true })
        .exec();
    }

    if (!updatedUser) {
      throw new HttpException(409, "Some thing when wrong");
    }
    return updatedUser;
  }

  public async getAllUser(
    page: number = 1,
    keyword?: string | undefined
  ): Promise<IPagination<IUser>> {
    const pageSize: number = Number(process.env.PAGE_SIZE || 10);
    let query = {};

    if (keyword) {
      query = {
        $or: [
          { email: { $regex: `.*${keyword}.*` } },
          { first_name: { $regex: `.*${keyword}.*` } },
          { last_name: { $regex: `.*${keyword}.*` } },
        ],
      };
    }

    const users = await this.userSchema
      .find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .exec();

    const rowCount = await this.userSchema.find(query).countDocuments().exec();

    return {
      total: rowCount,
      page: page,
      pageSize: pageSize,
      items: users,
    };
  }

  public async deleteUser(userId: string): Promise<IUser> {
    const deletedUser = await this.userSchema.findByIdAndDelete(userId).exec();
    if (!deletedUser) {
      throw new HttpException(400, "User is not exist");
    }
    return deletedUser;
  }

  private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = { id: user._id };
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expiresIn: number = 60;
    return {
      token: jwt.sign(dataInToken, secret, { expiresIn: expiresIn }),
    };
  }
}

export default UserService;
