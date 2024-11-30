import { UserReferences, UserSchema } from "@modules/users";
import { IChat, IMember, IMessage } from "./chat.interface";
import ChatSchema from "./chat.model";
import MessageSchema from "./message.model";
import MessageDTO from "./dtos/send_message.dto";
import { HttpException } from "@core/exceptions";
import mongoose from "mongoose";
import CreateChatRoomDTO from "./dtos/create_chat_room.dto";
import { getSchemaPopulate } from "@core/utils";
import { ChatRole } from "./enums/chat_role";

export default class ChatService {
  private chatSchema = ChatSchema;
  private userSchema = UserSchema;
  private messageSchema = MessageSchema;

  private chatReferenceFields = getSchemaPopulate(
    ["members.user"],
    UserReferences.selectFields
  );
  private messageReferenceFields = getSchemaPopulate(["sender", "chat"]);

  public async createChatRoom(
    userId: string,
    chatDTO: CreateChatRoomDTO
  ): Promise<IChat> {
    const user = await this.userSchema.findById(userId).exec();
    if (!user) throw new HttpException(400, "User id is not exist");
    const { members, type, name } = chatDTO;

    const numberOfMember = members.unshift(userId);

    const memberIds = members.map((member) => {
      if (member === userId && numberOfMember > 2) {
        return { user: member, role: ChatRole.admin };
      }
      return { user: member, role: ChatRole.member };
    });

    const newChat = new ChatSchema({ type, name });
    newChat.members = memberIds as IMember[];
    await newChat.save();
    await newChat.populate(this.chatReferenceFields);
    return newChat;
  }

  public async getAllChat(userId: string): Promise<IChat[]> {
    const user = await this.userSchema.findById(userId).exec();
    if (!user) throw new HttpException(400, "User id is not exist");

    const userObjIds = [new mongoose.Types.ObjectId(userId)];

    const chats = await this.chatSchema
      .find({
        members: {
          $elemMatch: {
            user: { $in: userObjIds },
          },
        },
      })
      .populate(this.chatReferenceFields)
      .exec();
    return chats;
  }

  public async getChatById(userId: string, chatId: string): Promise<IChat> {
    const user = await this.userSchema.findById(userId).exec();
    if (!user) throw new HttpException(400, "User id is not exist");
    const chat = await this.chatSchema
      .findById(chatId)
      .populate(this.chatReferenceFields)
      .exec();
    if (!chat) throw new HttpException(400, "Chat is not exist");
    return chat;
  }

  public async sendMessage(
    senderId: string,
    messageDTO: MessageDTO
  ): Promise<IMessage> {
    const sender = await this.userSchema.findById(senderId).exec();
    if (!sender) throw new HttpException(400, "User id is not exist");

    const { chatId, message_type, message_content } = messageDTO;
    const chat = await this.chatSchema.findById(chatId).exec();

    if (!chat) throw new HttpException(400, "Chat is not exist");

    const newMessage = new MessageSchema({
      sender: senderId,
      chat: chatId,
      message_type: message_type,
      message_content: message_content,
    });

    chat.recent_date = new Date();

    await newMessage.save();
    return newMessage;
  }

  public async getMessages(
    userId: string,
    chatId: string
  ): Promise<IMessage[]> {
    const chat = await this.chatSchema.findById(chatId).exec();
    if (!chat) throw new HttpException(400, "Chat is not exist");

    if (!chat.members.some((member) => member.user.toString() === userId)) {
      throw new HttpException(400, "You are not a member of this chat");
    }

    const messages = await this.messageSchema
      .find({ chat: chatId })
      .populate(this.messageReferenceFields)
      .exec();
    return messages;
  }
}
