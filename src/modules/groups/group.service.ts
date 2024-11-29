import { UserReferences, UserSchema } from "@modules/users";
import CreateGroupDTO from "./dtos/create_group.dto";
import IGroup, { IRequest, IMember } from "./group.interface";
import GroupSchema from "./group.model";
import { HttpException } from "@core/exceptions";
import { GroupRole } from "@core/enums";
import AddManagerDTO from "./dtos/add_manager.dto";

export default class GroupService {
  public groupSchema = GroupSchema;
  public userSchema = UserSchema;
  private referenceFields = UserReferences.getPopulate([
    "members.user",
    "member_request.user",
  ]);

  public async getAllGroup(): Promise<IGroup[]> {
    const groups = await this.groupSchema
      .find()
      .populate(this.referenceFields)
      .exec();

    return groups;
  }

  public async getGroupById(groupId: string): Promise<IGroup> {
    const group = await this.groupSchema
      .findById(groupId)
      .populate(this.referenceFields)
      .exec();
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    return group;
  }

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

    newGroup.members = [];
    newGroup.members.unshift({
      user: userId,
      role: GroupRole.creator.value,
      level: GroupRole.creator.level,
    } as IMember);

    const groupCreated = await newGroup.save();
    await groupCreated.populate(this.referenceFields);
    return groupCreated;
  }

  public async updateGroup(
    userId: string,
    groupId: string,
    groupDTO: CreateGroupDTO
  ): Promise<IGroup> {
    const group = await this.groupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const user = await this.userSchema
      .findById(userId)
      .select("-password")
      .exec();
    if (!user) {
      throw new HttpException(400, "User id is not exist");
    }

    const censor = group.members.find(
      (member) => member.user.toString() === userId
    );

    if (!censor || censor.level < GroupRole.admin.level) {
      throw new HttpException(400, "You don't have permission");
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
      .populate(this.referenceFields)
      .exec();

    if (!updatedGroup) {
      throw new HttpException(400, "Update is not success");
    }
    return updatedGroup!;
  }

  public async deleteGroup(userId: string, groupId: string): Promise<IGroup> {
    const group = await this.groupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const user = await this.userSchema
      .findById(userId)
      .select("-password")
      .exec();
    if (!user) {
      throw new HttpException(400, "User id is not exist");
    }

    const censor = group.members.find(
      (member) => member.user.toString() === userId
    );

    if (!censor || censor.role !== GroupRole.creator.value) {
      throw new HttpException(400, "You don't have permission");
    }

    const deletedGroup = await this.groupSchema
      .findByIdAndDelete(groupId)
      .populate(this.referenceFields)
      .exec();
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

    const user = await this.userSchema
      .findById(userId)
      .select("-password")
      .exec();
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

    await group.populate(this.referenceFields);

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

    const admin = await this.userSchema
      .findById(censor)
      .select("-password")
      .exec();
    if (
      !admin ||
      !group.members.some(
        (member) =>
          member.user.toString() === censor &&
          member.level >= GroupRole.admin.level
      )
    ) {
      throw new HttpException(400, "You don't have permission");
    }

    const user = await this.userSchema
      .findById(userId)
      .select("-password")
      .exec();
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
    await group.populate(this.referenceFields);

    return group;
  }

  public async addManager(
    adminId: string,
    addManagerDTO: AddManagerDTO
  ): Promise<IGroup> {
    const group = await this.groupSchema
      .findById(addManagerDTO.group_id)
      .exec();

    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const admin = await this.userSchema
      .findById(adminId)
      .select("-password")
      .exec();

    if (!admin) {
      throw new HttpException(400, "Your account don't exist");
    }

    const censor = group.members.find(
      (member) => member.user.toString() === adminId
    );

    if (
      !censor ||
      censor.level < GroupRole.getLevelFromString(addManagerDTO.role)
    ) {
      throw new HttpException(
        400,
        "You do not have permission to perform this action"
      );
    }

    if (
      group.members &&
      !group.members.some(
        (member) => member.user.toString() === addManagerDTO.user_id
      )
    ) {
      throw new HttpException(400, "This user is not a member of the group.");
    }

    for (let member of group.members) {
      if (member.user.toString() === addManagerDTO.user_id) {
        member.role = addManagerDTO.role;
        member.level = GroupRole.getLevelFromString(addManagerDTO.role);
      }
    }
    await group.save();
    await group.populate(this.referenceFields);

    return group;
  }

  public async deleteManager(
    adminId: string,
    userId: string,
    groupId: string
  ): Promise<IGroup> {
    const group = await this.groupSchema.findById(groupId).exec();
    console.log(group);

    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const admin = await this.userSchema
      .findById(adminId)
      .select("-password")
      .exec();

    if (!admin) {
      throw new HttpException(400, "Your account don't exist");
    }

    if (
      group.members &&
      !group.members.some(({ user }) => user.toString() === userId)
    ) {
      throw new HttpException(400, "This user is not a member of the group.");
    }

    const censor = group.members.find(
      (member) => member.user.toString() === adminId
    );
    const user = group.members.find(
      (member) => member.user.toString() === userId
    );

    if (!censor || censor.level <= user!.level) {
      throw new HttpException(
        400,
        "You do not have permission to perform this action"
      );
    }

    for (let member of group.members) {
      if (member.user.toString() === userId) {
        member.role = GroupRole.member.value;
        member.level = GroupRole.member.level;
      }
    }

    await group.save();
    await group.populate(this.referenceFields);

    return group;
  }

  public async getMemberList(groupId: string): Promise<IMember[]> {
    const group = await this.groupSchema
      .findById(groupId)
      .populate(this.referenceFields)
      .exec();

    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    return group.members;
  }

  public async deleteMember(
    adminId: string,
    userId: string,
    groupId: string
  ): Promise<IMember[]> {
    const group = await this.groupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const admin = await this.userSchema
      .findById(adminId)
      .select("-password")
      .exec();

    if (!admin) {
      throw new HttpException(400, "Your account don't exist");
    }

    if (
      group.members &&
      !group.members.some((member) => member.user.toString() === userId)
    ) {
      throw new HttpException(400, "This user is not a member of the group.");
    }

    const censor = group.members.find(
      (member) => member.user.toString() === adminId
    );

    const user = group.members.find(
      (member) => member.user.toString() === userId
    );

    if (!censor || censor.level <= user!.level) {
      throw new HttpException(
        400,
        "You do not have permission to perform this action"
      );
    }

    group.members = group.members.filter(
      ({ user }) => user.toString() !== userId
    );
    await group.save();
    await group.populate(this.referenceFields);
    return group.members;
  }
}
