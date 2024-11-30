import mongoose from "mongoose";
import { IMessage } from "./chat.interface";

const MessageSchema = new mongoose.Schema({
  serder: { type: mongoose.Schema.Types.ObjectId, ref: "users", require: true },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chats",
    require: true,
  },
  message_type: {
    type: String,
    enum: ["text", "image", "audio"],
    require: true,
  },
  message_content: { type: String, require: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

export default mongoose.model<IMessage & mongoose.Document>(
  "messages",
  MessageSchema
);
