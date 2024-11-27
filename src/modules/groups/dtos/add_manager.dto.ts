import { GroupRole } from "@core/enums";
import { IsNotEmpty } from "class-validator";

export default class AddManagerDTO {
  constructor(user_id: string, group_id: string, role: string) {
    this.user_id = user_id;
    this.group_id = group_id;
    this.role = role;
  }

  @IsNotEmpty()
  public user_id: string;
  @IsNotEmpty()
  public group_id: string;
  @IsNotEmpty()
  public role: string;
}
