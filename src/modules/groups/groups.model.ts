import mongoose from "mongoose";
import IGroup from "./groups.interface";

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },

  code: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      date: {
        type: Date,
        default: Date.now,
      },
      role: {
        type: String,
        enum: ["creator", "admin", "mod", "member"],
        default: "member",
      },
      level: {
        type: Number,
        default: 0,
      },
    },
  ],
  member_requests: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IGroup & mongoose.Document>("group", GroupSchema);
