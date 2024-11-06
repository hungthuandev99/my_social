import { IUser, UserSchema } from "@modules/users";
import ProfileSchema from "./profile.model";
import { HttpException } from "@core/exceptions";
import CreateProfileDTO from "./dtos/create_profile.dto";
import normalizeUrl from "normalize-url";
import { ISocial, IProfile } from "./profile.interface";

class ProfileService {
  public profileSchema = ProfileSchema;
  public userSchema = UserSchema;

  public async getCurrentProfile(userId: string): Promise<Partial<IUser>> {
    const user = await this.profileSchema
      .findOne({ user: userId })
      .populate("user", ["name", "avatar"]);
    console.log(user);

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
    console.log(profileFields);

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
      .exec();
    return profile;
  }

  public async deleteProfile(userId: string): Promise<void> {
    await this.profileSchema.findOneAndDelete({ user: userId }).exec();
    await this.userSchema.findOneAndDelete({ _id: userId }).exec();
  }
}

export default ProfileService;
