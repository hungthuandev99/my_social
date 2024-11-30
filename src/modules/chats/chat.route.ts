import { Router } from "express";
import ChatController from "./chat.controller";
import { authMiddleware, validationInputMiddleware } from "@core/middleware";
import MessageDTO from "./dtos/send_message.dto";
import CreateChatRoomDTO from "./dtos/create_chat_room.dto";

export default class ChatRoute {
  public path = "/chats";
  public router = Router();
  public controller = new ChatController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      this.path,
      authMiddleware,
      validationInputMiddleware(CreateChatRoomDTO, true),
      this.controller.createChatRoom
    );
    this.router.get(
      this.path + "/:id",
      authMiddleware,
      this.controller.getChatById
    );
    this.router.get(this.path, authMiddleware, this.controller.getAllChat);
    this.router.post(
      this.path + "/message",
      authMiddleware,
      validationInputMiddleware(MessageDTO, true),
      this.controller.sendMessage
    );
    this.router.get(
      this.path + "/:id/message",
      authMiddleware,
      this.controller.getMessages
    );
  }
}
