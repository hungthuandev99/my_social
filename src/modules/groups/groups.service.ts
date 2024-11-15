import { UserSchema } from "@modules/users";
import CreateGroupDTO from "./dtos/create_group.dto";
import IGroup from "./groups.interface";
import GroupSchema from "./groups.model";
import { HttpException } from "@core/exceptions";

export default class GroupService {
  public groupSchema = GroupSchema;
  public userSchema = UserSchema;

  public async createGroup(
    userId: string,
    groupDTO: CreateGroupDTO
  ): Promise<IGroup> {
    const user = await this.userSchema
      .findById(userId)
      .select("-password")
      .exec();
    if (!user) {
      throw new HttpException(400, "User id is not exist");
    }

    const existGroup = await this.groupSchema
      .find({
        $or: [{ name: groupDTO.name }, { code: groupDTO.code }],
      })
      .exec();

    if (existGroup.length > 0) {
      throw new HttpException(400, "Name or code existed");
    }

    const newGroup = new GroupSchema({
      ...groupDTO,
    });

    const groupCreated = await newGroup.save();
    return groupCreated;
  }

  public async getAllGroup(): Promise<IGroup[]> {
    const groups = await this.groupSchema.find().exec();
    return groups;
  }
}
