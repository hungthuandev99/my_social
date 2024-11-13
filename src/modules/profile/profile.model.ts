import mongoose from "mongoose";
import { IProfile } from "./profile.interface";

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  company: String,
  website: String,
  location: String,
  status: {
    type: String,
    require: true,
  },
  skills: {
    type: [String],
    require: true,
  },
  bio: String,
  experiences: [
    {
      title: { type: String, require: true },
      company: { type: String, require: true },
      location: { type: String, require: true },
      from: { type: Date, require: true },
      to: { type: Date },
      current: { type: Boolean, default: false },
      description: { type: String },
    },
  ],
  educations: [
    {
      school: { type: String, require: true },
      degree: { type: String, require: true },
      field_of_study: { type: String, require: true },
      from: { type: Date, require: true },
      to: { type: Date },
      current: { type: Boolean, default: false },
      description: { type: String },
    },
  ],
  socials: {
    youtube: String,
    twitter: String,
    linkedin: String,
    facebook: String,
    instagram: String,
  },
  followings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  followers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  friends: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      friend_date: {
        type: Date,
      },
    },
  ],
  friend_requests: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      request_date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  friend_request_sent: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      request_date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IProfile & mongoose.Document>(
  "profile",
  ProfileSchema
);
