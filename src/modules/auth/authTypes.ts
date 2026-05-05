import { IUserResponse } from "../user/userTypes";

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: IUserResponse;
}
