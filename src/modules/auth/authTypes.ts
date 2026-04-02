import { IUserResponse } from "../user/userTypes";

export interface LoginResponse {
  token: string;
  user: IUserResponse;
}
