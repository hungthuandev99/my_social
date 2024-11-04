import { DataStoredInToken, TokenData } from "@modules/auth";
import UserSchema from "./user.model";
import RegisterDTO from "./dtos/register.dto";
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";
import IUser from "./user.interface";
import jwt from "jsonwebtoken";

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

    let updateUserId;
    if (model.password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(model.password!, salt);
      updateUserId = await this.userSchema
        .findByIdAndUpdate(userId, {
          ...model,
          password: hashedPassword,
        })
        .exec();
    } else {
      updateUserId = await this.userSchema
        .findByIdAndUpdate(userId, model)
        .exec();
    }

    if (!updateUserId) {
      throw new HttpException(409, "Some thing when wrong");
    }
    return updateUserId;
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
