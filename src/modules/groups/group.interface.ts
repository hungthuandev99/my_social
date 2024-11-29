export default interface IGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  members: IMember[];
  member_requests: IRequest[];
  date: Date;
}

export interface IMember {
  user: string;
  date: Date;
  role: string;
  level: number;
}

export interface IRequest {
  user: string;
  date: Date;
}
