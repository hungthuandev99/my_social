import mongoose from "mongoose";
import { IChat } from "./chat.interface";

const ChatSchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String, enum: ["private", "group"], require: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      join_date: { type: Date, default: Date.now },
      delete_message_date: { type: Date },
      role: { type: String, enum: ["admin", "member"], default: "member" },
    },
  ],
  date: { type: Date, default: Date.now },
  recent_date: { type: Date, default: Date.now },
});

export default mongoose.model<IChat & mongoose.Document>("chats", ChatSchema);
