import { UserSchema } from "@modules/users";
import CreateGroupDTO from "./dtos/create_group.dto";
import IGroup, { IManager, IMember } from "./groups.interface";
import GroupSchema from "./groups.model";
import { HttpException } from "@core/exceptions";
import { GroupManagerRole } from "@core/enums";
import AddManagerDTO from "./dtos/add_manager.dto";

export default class GroupService {
  public groupSchema = GroupSchema;
  public userSchema = UserSchema;

  private selectFields = ["first_name", "last_name", "avatar"];
  public referenceFields = [
    {
      path: "creator",
      select: this.selectFields,
    },
    {
      path: "members",
      populate: { path: "user", select: this.selectFields },
    },
    {
      path: "member_requests",
      populate: { path: "user", select: this.selectFields },
    },
    {
      path: "managers",
      populate: { path: "user", select: this.selectFields },
    },
  ];

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
    newGroup.members = [];
    newGroup.members.unshift({ user: userId } as IMember);

    const groupCreated = await newGroup.save();
    return groupCreated;
  }

  public async getAllGroup(): Promise<IGroup[]> {
    const groups = await this.groupSchema
      .find()
      .populate(this.referenceFields)
      .exec();

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
      .populate(this.referenceFields)
      .exec();

    if (!updatedGroup) {
      throw new HttpException(400, "Update is not success");
    }
    return updatedGroup!;
  }

  public async deleteGroup(groupId: string): Promise<IGroup> {
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

    const admin = await this.userSchema.findById(censor).exec();
    if (
      !admin ||
      (group.creator.toString() !== censor &&
        !group.managers.some(({ user }) => user.toString() === censor))
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

    const admin = await this.userSchema.findById(adminId).exec();

    if (!admin) {
      throw new HttpException(400, "Your account don't exist");
    }

    if (!this.checkAddManagerPermission(adminId, addManagerDTO, group)) {
      throw new HttpException(
        400,
        "You do not have permission to perform this action"
      );
    }

    if (
      group.members &&
      !group.members.some(
        ({ user }) => user.toString() === addManagerDTO.user_id
      )
    ) {
      throw new HttpException(400, "This user is not a member of the group.");
    }

    if (
      group.managers &&
      group.managers.some(
        ({ user }) => user.toString() === addManagerDTO.user_id
      )
    ) {
      throw new HttpException(
        400,
        "This user is already a manager of the group"
      );
    }

    group.managers.unshift({
      user: addManagerDTO.user_id,
      role: addManagerDTO.role,
    } as IManager);
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
    if (!group) {
      throw new HttpException(400, "Group is not exist");
    }

    const admin = await this.userSchema.findById(adminId).exec();

    if (!admin) {
      throw new HttpException(400, "Your account don't exist");
    }

    if (
      group.members &&
      !group.members.some(({ user }) => user.toString() === userId)
    ) {
      throw new HttpException(400, "This user is not a member of the group.");
    }

    if (
      group.managers &&
      group.managers.some(({ user }) => user.toString() === userId)
    ) {
      throw new HttpException(
        400,
        "This user is already a manager of the group"
      );
    }

    if (!this.checkDeleteManagerPermission(adminId, userId, group)) {
      throw new HttpException(
        400,
        "You do not have permission to perform this action"
      );
    }

    group.managers.filter(({ user }) => user.toString() !== userId);
    await group.save();
    await group.populate(this.referenceFields);

    return group;
  }

  private checkAddManagerPermission(
    grantor: string,
    add_managerDTO: AddManagerDTO,
    group: IGroup
  ): boolean {
    switch (add_managerDTO.role) {
      case GroupManagerRole.admin:
        return group.creator.toString() === grantor;
      case GroupManagerRole.mod:
        const isCreator = group.creator.toString() === grantor;
        const isAdmin = group.managers.some(
          (manager) =>
            manager.role === GroupManagerRole.admin &&
            manager.user.toString() === grantor
        );
        return isCreator || isAdmin;
      default:
        return false;
    }
  }

  private checkDeleteManagerPermission(
    grantor: string,
    grantee: string,
    group: IGroup
  ): boolean {
    if (grantor === group.creator.toString()) {
      return true;
    }

    const admin = group.managers.find(
      ({ user }) => user.toString() === grantor
    );
    const user = group.managers.find(({ user }) => user.toString() === grantee);

    if (!admin || !user) return false;

    return (
      admin.role === GroupManagerRole.admin &&
      user.role !== GroupManagerRole.admin
    );
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
}
