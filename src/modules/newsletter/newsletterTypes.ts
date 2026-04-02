import { Document, Types } from "mongoose";

export interface ISubscriber {
  email: string;
  subscribedAt?: Date;
}

export interface ISubscriberDocument extends ISubscriber, Document {
  _id: Types.ObjectId;
}

export interface ISubscriberResponse {
  id: string;
  email: string;
  subscribedAt?: Date;
}
