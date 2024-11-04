import { DataStoredInToken, TokenData } from "@modules/auth";
import { UserSchema, IUser } from "@modules/users";
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import LoginDTO from "./dtos/login.dto";

class AuthSerivce {
  public userSchema = UserSchema;

  public async login(model: LoginDTO): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }

    const user = await this.userSchema.findOne({ email: model.email });
    if (!user) {
      throw new HttpException(400, `Your email ${model.email} is not exist.`);
    }

    const isMatchPassword = await bcryptjs.compare(
      model.password,
      user.password
    );
    if (!isMatchPassword) {
      throw new HttpException(400, "Credential is not valid");
    }
    return this.createToken(user);
  }

  public async getCurrentLoginUser(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId);
    if (!user) {
      throw new HttpException(404, "User is not exist");
    }

    return user;
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

export default AuthSerivce;
