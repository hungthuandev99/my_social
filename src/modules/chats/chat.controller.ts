import { Request, Response, NextFunction } from "express";
import ChatService from "./chat.service";
import { Result } from "@core/utils";

export default class ChatController {
  private chatService = new ChatService();

  public createChatRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const chatDTO = req.body;
      const chat = await this.chatService.createChatRoom(req.user.id, chatDTO);
      res.status(200).json(new Result(chat));
    } catch (error) {
      next(error);
    }
  };

  public getChatById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const chat = await this.chatService.getChatById(
        req.user.id,
        req.params.id
      );
      res.status(200).json(new Result(chat));
    } catch (error) {
      next(error);
    }
  };

  public getAllChat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const chats = await this.chatService.getAllChat(userId);
      res.status(200).json(new Result(chats));
    } catch (error) {
      next(error);
    }
  };

  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sender = req.user.id;
      const messageDTO = req.body;
      const conversation = await this.chatService.sendMessage(
        sender,
        messageDTO
      );
      res.status(200).json(new Result(conversation));
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const chatId = req.params.id;
      const messages = await this.chatService.getMessages(req.user.id, chatId);
      res.status(200).json(new Result(messages));
    } catch (error) {
      next(error);
    }
  };
}
