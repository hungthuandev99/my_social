export interface IMessage {
  sender: string;
  chat_id: string;
  message_type: string;
  message_content: string;
  date: Date;
  status: string;
}

export interface IChat {
  name?: string;
  type: string;
  members: IMember[];
  date: Date;
  recent_date: Date;
}

export interface IMember {
  user: string;
  role: string;
  join_date: Date;
  recent_date: Date;
}
