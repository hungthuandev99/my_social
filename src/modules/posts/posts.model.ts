import mongoose from "mongoose";
import { IPost } from "./posts.interface";

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  text: {
    type: String,
    require: true,
  },
  avatar: String,
  name: String,
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
      },
      text: {
        type: String,
        require: true,
      },
      name: String,
      avatar: String,
      date: { type: Date, default: Date.now },
    },
  ],
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IPost & mongoose.Document>("post", PostSchema);
