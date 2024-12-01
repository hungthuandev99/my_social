import { IUser, UserReferences, UserSchema } from "@modules/users";
import ProfileSchema from "./profile.model";
import { HttpException } from "@core/exceptions";
import CreateProfileDTO from "./dtos/create_profile.dto";
import normalizeUrl from "normalize-url";
import {
  ISocial,
  IProfile,
  IExperience,
  IEducation,
  IFollow,
  IFriend,
} from "./profile.interface";
import AddExperienceDTO from "./dtos/add_experience.dto";
import AddEducationDTO from "./dtos/add_education.dto";
import { getSchemaPopulate } from "@core/utils";

class ProfileService {
  public profileSchema = ProfileSchema;
  public userSchema = UserSchema;

  public referenceFields = getSchemaPopulate(
    [
      "user",
      "followers.user",
      "followings.user",
      "friends.user",
      "friend_request.user",
      "friend_request_sent.user",
    ],
    UserReferences.selectFields
  );

  public async getCurrentProfile(userId: string): Promise<Partial<IUser>> {
    const user = await this.profileSchema
      .findOne({ user: userId })
      .populate(this.referenceFields);

    if (!user) {
      throw new HttpException(400, "There is no profile for this user");
    }
    return user;
  }
  public async createProfile(
    userId: string,
    profileDTO: CreateProfileDTO
  ): Promise<IProfile> {
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = profileDTO;

    const profileFields: Partial<IProfile> = {
      user: userId,
      company,
      location,
      website:
        website && website != ""
          ? normalizeUrl(website.toString(), { forceHttps: true })
          : undefined,
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill: string) => " " + skill.trim()),
      status,
    };

    const socialFields: ISocial = {
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    };

    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0) {
        socialFields[key] = normalizeUrl(value, { forceHttps: true });
      }
    }

    profileFields.socials = socialFields;

    const profile = await this.profileSchema
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $set: profileFields },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      )
      .populate(this.referenceFields)
      .exec();
    return profile;
  }

  public async deleteProfile(userId: string): Promise<void> {
    await this.profileSchema.findOneAndDelete({ user: userId }).exec();
    await this.userSchema.findOneAndDelete({ _id: userId }).exec();
  }

  public async addExperience(
    userId: string,
    experience: AddExperienceDTO
  ): Promise<IProfile> {
    const newExperience = {
      ...experience,
    };

    const profile = await this.profileSchema.findOne({ user: userId }).exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.experiences.unshift(newExperience as IExperience);
    await profile.save();
    await profile.populate(this.referenceFields);
    return profile;
  }

  public async deleteExperience(
    userId: string,
    experienceId: string
  ): Promise<IProfile> {
    const profile = await this.profileSchema
      .findOne({ user: userId })
      .populate(this.referenceFields)
      .exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.experiences = profile.experiences.filter(
      (exp) => exp._id.toString() !== experienceId
    );
    await profile.save();
    return profile;
  }

  public async addEducation(
    userId: string,
    education: AddEducationDTO
  ): Promise<IProfile> {
    const newEducation = {
      ...education,
    };

    const profile = await this.profileSchema
      .findOne({ user: userId })
      .populate(this.referenceFields)
      .exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.educations.unshift(newEducation as IEducation);
    await profile.save();
    return profile;
  }

  public async deleteEducation(
    userId: string,
    educationId: string
  ): Promise<IProfile> {
    const profile = await this.profileSchema
      .findOne({ user: userId })
      .populate(this.referenceFields)
      .exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.educations = profile.educations.filter(
      (edu) => edu._id.toString() !== educationId
    );
    await profile.save();
    return profile;
  }

  public async follow(fromUser: string, toUser: string): Promise<IFollow[]> {
    const fromProfile = await this.profileSchema
      .findOne({ user: fromUser })
      .exec();
    if (!fromProfile) {
      throw new HttpException(400, "There is not profile for your user");
    }

    const toProfile = await this.profileSchema.findOne({ user: toUser }).exec();
    if (!toProfile) {
      throw new HttpException(400, "There is not profile for target user");
    }

    if (
      toProfile.followers &&
      toProfile.followers.some((follow) => follow.user.toString() === fromUser)
    ) {
      throw new HttpException(
        400,
        "Target user has already been followed from user"
      );
    }

    if (
      fromProfile.followings &&
      fromProfile.followings.some(
        (follow: IFollow) => follow.user.toString() === toUser
      )
    ) {
      throw new HttpException(400, "Profile has been followed");
    }
    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings.unshift({ user: toUser });
    if (!toProfile.followers) toProfile.followers = [];
    toProfile.followers.unshift({ user: fromUser });
    await fromProfile.save();
    await toProfile.save();
    await fromProfile.populate(this.referenceFields);
    return fromProfile.followings;
  }

  public async unfollow(fromUser: string, toUser: string) {
    const fromProfile = await this.profileSchema
      .findOne({ user: fromUser })
      .exec();
    if (!fromProfile) {
      throw new HttpException(400, "There is not profile for your user");
    }

    const toProfile = await this.profileSchema.findOne({ user: toUser }).exec();
    if (!toProfile) {
      throw new HttpException(400, "There is not profile for target user");
    }

    if (
      toProfile.followers &&
      !toProfile.followers.some((follow) => follow.user.toString() === fromUser)
    ) {
      throw new HttpException(400, "You has not being followed this user");
    }

    if (
      fromProfile.followings &&
      !fromProfile.followings.some(
        (follow: IFollow) => follow.user.toString() === toUser
      )
    ) {
      throw new HttpException(400, "You has not been yet followed this user");
    }
    if (!fromProfile.followings) fromProfile.followings = [];
    fromProfile.followings = fromProfile.followings.filter(
      ({ user }) => user.toString() !== toUser
    );

    if (!toProfile.followers) toProfile.followers = [];
    toProfile.followers = toProfile.followers.filter(
      ({ user }) => user.toString() !== fromUser
    );

    await fromProfile.save();
    await toProfile.save();
    await fromProfile.populate(this.referenceFields);
    return fromProfile.followings;
  }

  public async addFriend(fromUser: string, toUser: string): Promise<IProfile> {
    const fromProfile = await this.profileSchema
      .findOne({ user: fromUser })
      .exec();
    if (!fromProfile) {
      throw new HttpException(400, "There is not profile for your user");
    }

    const toProfile = await this.profileSchema.findOne({ user: toUser }).exec();
    if (!toProfile) {
      throw new HttpException(400, "There is not profile for target user");
    }

    if (
      toProfile.friends &&
      toProfile.friends.some(
        (friend: IFriend) => friend.user.toString() === fromUser
      )
    ) {
      throw new HttpException(
        400,
        "Target user has already been be friend by from user"
      );
    }

    if (!toProfile.friend_requests) toProfile.friend_requests = [];
    toProfile.friend_requests.unshift({ user: fromUser } as IFriend);

    if (!fromProfile.friend_request_sent) fromProfile.friend_request_sent = [];

    fromProfile.friend_request_sent.filter(
      ({ user }) => user.toString() !== toUser
    );

    fromProfile.friend_request_sent.unshift({ user: toUser } as IFriend);

    await toProfile.save();
    await fromProfile.save();
    await fromProfile.populate(this.referenceFields);
    return fromProfile;
  }

  public async unfriend(fromUser: string, toUser: string): Promise<IProfile> {
    const fromProfile = await this.profileSchema
      .findOne({ user: fromUser })
      .exec();
    if (!fromProfile) {
      throw new HttpException(400, "There is not profile for your user");
    }

    const toProfile = await this.profileSchema.findOne({ user: toUser }).exec();
    if (!toProfile) {
      throw new HttpException(400, "There is not profile for target user");
    }

    if (
      (fromProfile.friends &&
        fromProfile.friends.some(({ user }) => user.toString() !== toUser)) ||
      (toProfile.friends &&
        toProfile.friends.some(({ user }) => user.toString() !== fromUser))
    ) {
      throw new HttpException(400, "You are not friends with this user");
    }

    fromProfile.friends = fromProfile.friends.filter(
      ({ user }) => user.toString() !== toUser
    );

    toProfile.friends = toProfile.friends.filter(
      ({ user }) => user.toString() !== fromUser
    );

    await fromProfile.save();
    await toProfile.save();

    await fromProfile.populate(this.referenceFields);
    return fromProfile;
  }

  public async acceptFriendRequest(
    currentUser: string,
    requestUser: string
  ): Promise<IProfile> {
    const currentProfile = await this.profileSchema
      .findOne({ user: currentUser })
      .exec();
    if (!currentProfile) {
      throw new HttpException(400, "There is not profile for your user");
    }

    const requestProfile = await this.profileSchema
      .findOne({ user: requestUser })
      .exec();
    if (!requestProfile) {
      throw new HttpException(400, "There is not profile for target user");
    }

    if (
      (currentProfile.friends &&
        currentProfile.friends.some(
          ({ user }) => user.toString() === requestUser
        )) ||
      (requestProfile.friends &&
        requestProfile.friends.some(
          ({ user }) => user.toString() === currentUser
        ))
    ) {
      throw new HttpException(400, "This user has already been be friend");
    }

    await currentProfile.friends.unshift({ user: requestUser } as IFriend);
    await currentProfile.friend_requests.filter(
      ({ user }) => user.toString() !== requestUser
    );

    await currentProfile.save();

    await requestProfile.friends.unshift({ user: currentUser } as IFriend);
    await requestProfile.friend_request_sent.filter(
      ({ user }) => user.toString() !== currentUser
    );
    await requestProfile.save();

    await currentProfile.populate(this.referenceFields);

    return currentProfile;
  }
}

export default ProfileService;
