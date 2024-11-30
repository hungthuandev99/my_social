import { IsNotEmpty } from "class-validator";

export default class CreateChatRoomDTO {
  constructor(members: string[], type: string, name: string | undefined) {
    this.members = members;
    this.type = type;
    this.name = name;
  }

  public members: string[];
  @IsNotEmpty()
  public type: string;
  public name: string | undefined;
}
