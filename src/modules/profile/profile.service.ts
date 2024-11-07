import { IUser, UserSchema } from "@modules/users";
import ProfileSchema from "./profile.model";
import { HttpException } from "@core/exceptions";
import CreateProfileDTO from "./dtos/create_profile.dto";
import normalizeUrl from "normalize-url";
import {
  ISocial,
  IProfile,
  IExperience,
  IEducation,
} from "./profile.interface";
import AddExperienceDTO from "./dtos/add_experience.dto";
import AddEducationDTO from "./dtos/add_education.dto";

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

  public async addExperience(
    userId: string,
    experience: AddExperienceDTO
  ): Promise<IProfile> {
    const { title, company, location, from, to, current, description } =
      experience;
    const newExperience = {
      ...experience,
    };

    const profile = await this.profileSchema.findOne({ user: userId }).exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.experiences.unshift(newExperience as IExperience);
    await profile.save();
    return profile;
  }

  public async deleteExperience(
    userId: string,
    experienceId: string
  ): Promise<IProfile> {
    const profile = await this.profileSchema.findOne({ user: userId }).exec();
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

    const profile = await this.profileSchema.findOne({ user: userId }).exec();
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
    const profile = await this.profileSchema.findOne({ user: userId }).exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.educations = profile.educations.filter(
      (edu) => edu._id.toString() !== educationId
    );
    await profile.save();
    return profile;
  }
}

export default ProfileService;
