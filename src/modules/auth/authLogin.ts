import { generateToken } from "../../shared/utils/generateToken";
import { findUserByEmail } from "../user/userRepository";
import { LoginDto } from "./authDto";
import { createAppError } from "./authErrors";
import { mapAuthUserResponse } from "./authMapper";
import { comparePassword } from "./authSecurity";
import { LoginResponse } from "./authTypes";
import { validateLoginInput } from "./authValidation";

export const loginUser = async (
  loginData: LoginDto,
): Promise<LoginResponse> => {
  validateLoginInput(loginData);

  const { email, password } = loginData;

  const user = await findUserByEmail(email);

  if (!user) {
    throw createAppError("User not found with the email provided", 404);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw createAppError("Password or email not valid", 401);
  }

  const token = generateToken(user);

  return {
    token,
    user: mapAuthUserResponse(user),
  };
};
