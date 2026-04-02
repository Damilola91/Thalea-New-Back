import { Document, Types } from "mongoose";

export const allowedRoles = ["admin", "user"] as const;

export type UserRole = (typeof allowedRoles)[number];

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtResetPasswordPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
