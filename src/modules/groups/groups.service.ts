import { UserSchema } from "@modules/users";
import CreateGroupDTO from "./dtos/create_group.dto";
import IGroup, { IMember } from "./groups.interface";
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

    newGroup.creator = userId;

    const groupCreated = await newGroup.save();
    return groupCreated;
  }

  public async getAllGroup(): Promise<IGroup[]> {
    const groups = await this.groupSchema.find().exec();
    return groups;
  }

  public async updateGroup(
    groupId: string,
    groupDTO: CreateGroupDTO
  ): Promise<IGroup> {
    const group = await this.groupSchema.findById(groupId);
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const existGroup = await this.groupSchema.find({
      $and: [
        { $or: [{ name: groupDTO.name }, { code: groupDTO.code }] },
        { _id: { $ne: groupId } },
      ],
    });

    if (existGroup.length > 0) {
      throw new HttpException(400, "Name or code existed");
    }

    const updateFields = { ...groupDTO };

    const updatedGroup = await this.groupSchema
      .findOneAndUpdate({ _id: groupId }, { $set: updateFields }, { new: true })
      .exec();

    if (!updatedGroup) {
      throw new HttpException(400, "Update is not success");
    }
    return updatedGroup!;
  }

  public async deleteGroup(groupId: string): Promise<IGroup> {
    const deletedGroup = await this.groupSchema.findByIdAndDelete(groupId);
    if (!deletedGroup) {
      throw new HttpException(400, "Delete is not success");
    }
    return deletedGroup;
  }

  public async joinGroup(userId: string, groupId: string): Promise<IGroup> {
    const group = await this.groupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(400, "User is not exist");
    }
    if (
      group.member_requests &&
      group.member_requests.some(({ user }) => user.toString() === userId)
    ) {
      throw new HttpException(
        400,
        "You has already been requested to join this group"
      );
    }

    if (
      group.members &&
      group.members.some(({ user }) => user.toString() === userId)
    ) {
      throw new HttpException(
        400,
        "You has already been be a member of this group"
      );
    }

    group.member_requests.unshift({ user: userId } as IMember);
    await group.save();

    return group;
  }

  public async approveJoinRequest(
    censor: string,
    userId: string,
    groupId: string
  ): Promise<IGroup> {
    const group = await this.groupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const admin = await this.userSchema.findById(censor).exec();
    if (
      !admin ||
      group.creator !== censor ||
      !group.managers.some(({ user }) => user.toString() === censor)
    ) {
      throw new HttpException(400, "You don't have permission");
    }

    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(400, "User is not exist");
    }

    if (
      group.member_requests &&
      !group.member_requests.some(({ user }) => user.toString() === userId)
    ) {
      throw new HttpException(400, "There is not any request of this user");
    }

    group.member_requests = group.member_requests.filter(
      ({ user }) => user.toString() !== userId
    );

    group.members.unshift({ user: userId } as IMember);
    await group.save();

    return group;
  }
}
