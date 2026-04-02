import bcrypt from "bcrypt";
import { LoginDto } from "./authDto";
import { LoginResponse } from "./authTypes";
import { findUserByEmail } from "../user/userRepository";
import { IUserDocument, IUserResponse } from "../user/userTypes";
import { generateToken } from "../../shared/utils/generateToken";

const mapUserResponse = (user: IUserDocument): IUserResponse => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const loginService = async (
  loginData: LoginDto,
): Promise<LoginResponse> => {
  const { email, password } = loginData;

  if (!email || !password) {
    const error = new Error("Email and password are required") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const user = await findUserByEmail(email);

  if (!user) {
    const error = new Error(
      "User not found with the email provided",
    ) as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Password or email not valid") as Error & {
      status?: number;
    };
    error.status = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    token,
    user: mapUserResponse(user),
  };
};
