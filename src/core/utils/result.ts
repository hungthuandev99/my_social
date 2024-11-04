import { Response } from "express";

class Result {
  constructor(data: any = undefined, message: any = undefined) {
    this.success = data ? true : false;
    this.message = message;
    this.data = data;
  }
  public success: boolean;
  public message: string | undefined;
  public data: any;
}

export default Result;
