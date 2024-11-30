import { IsNotEmpty } from "class-validator";

export default class MessageDTO {
  constructor(chatId: string, message_type: string, message_content: string) {
    this.chatId = chatId;

    this.message_type = message_type;
    this.message_content = message_content;
  }
  @IsNotEmpty()
  public chatId: string;
  @IsNotEmpty()
  public message_type: string;
  @IsNotEmpty()
  public message_content: string;
}
