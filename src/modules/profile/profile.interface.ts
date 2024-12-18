export interface IProfile {
  _id: string;
  user: string;
  company: string;
  website: string;
  location: string;
  status: string;
  skills: string[];
  bio: string;
  experiences: IExperience[];
  educations: IEducation[];
  socials: ISocial;
  followings: IFollow[];
  followers: IFollow[];
  friends: IFriend[];
  friend_requests: IFriend[];
  friend_request_sent: IFriend[];
  date: Date;
}

export interface IExperience {
  _id: string;
  title: string;
  company: string;
  location: string;
  from: Date;
  to: Date;
  current: boolean;
  description: string;
}

export interface IEducation {
  _id: string;
  school: string;
  degree: string;
  field_of_study: string;
  from: Date;
  to: Date;
  current: boolean;
  description: string;
}

export interface ISocial extends Record<string, string> {
  youtube: string;
  twitter: string;
  linkedin: string;
  facebook: string;
  instagram: string;
}

export interface IFollow {
  user: string;
}

export interface IFriend {
  user: string;
  date_request: Date;
}
