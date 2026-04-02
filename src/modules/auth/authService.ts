import { LoginDto } from "./authDto";
import { loginUser } from "./authLogin";
import { LoginResponse } from "./authTypes";

export const loginService = async (
  loginData: LoginDto,
): Promise<LoginResponse> => {
  return await loginUser(loginData);
};
