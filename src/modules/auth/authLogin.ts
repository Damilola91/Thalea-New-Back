import { generateToken } from "../../shared/utils/generateToken";
import { generateRefreshToken } from "../../shared/utils/generateRefreshToken";
import { findUserByEmail } from "../user/userRepository";
import { LoginDto } from "./authDto";
import { createAppError } from "./authErrors";
import { mapAuthUserResponse } from "./authMapper";
import { loginSchema } from "./authSchemas";
import { comparePassword } from "./authSecurity";
import { LoginResponse } from "./authTypes";

export const loginUser = async (
  loginData: LoginDto,
): Promise<LoginResponse> => {
  const validatedData = loginSchema.parse(loginData);

  const { email, password } = validatedData;

  const user = await findUserByEmail(email);

  if (!user) {
    throw createAppError("User not found with the email provided", 404);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw createAppError("Password or email not valid", 401);
  }

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    token,
    refreshToken,
    user: mapAuthUserResponse(user),
  };
};
