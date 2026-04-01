import bcrypt from "bcrypt";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import {
  createUser,
  deleteUserById,
  findAllUsers,
  findUserByEmail,
  updateUserById,
} from "./userRepository";
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from "./userDto";
import {
  IUserDocument,
  IUserResponse,
  JwtResetPasswordPayload,
} from "./userTypes";

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

export const createUserService = async (
  userData: CreateUserDto,
): Promise<IUserResponse> => {
  const existingUser = await findUserByEmail(userData.email);

  if (existingUser) {
    const error = new Error("Email già in uso") as Error & { status?: number };
    error.status = 409;
    throw error;
  }

  const createdUser = await createUser(userData);
  return mapUserResponse(createdUser);
};

export const updateUserService = async (
  userId: string,
  updateData: UpdateUserDto,
): Promise<IUserResponse | null> => {
  const dataToUpdate = { ...updateData };

  if (dataToUpdate.password) {
    const salt = await bcrypt.genSalt(10);
    dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, salt);
  }

  const updatedUser = await updateUserById(userId, dataToUpdate);

  if (!updatedUser) {
    return null;
  }

  return mapUserResponse(updatedUser);
};

export const updatePasswordService = async (
  data: UpdatePasswordDto,
): Promise<void> => {
  const { userId, newPassword, token } = data;

  if (!newPassword || newPassword.length < 8) {
    const error = new Error(
      "La nuova password è obbligatoria e deve contenere almeno 8 caratteri.",
    ) as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  if (!token) {
    const error = new Error("Token mancante") as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET mancante nel file .env");
  }

  let payload: string | JwtResetPasswordPayload;

  try {
    payload = jwt.verify(token, jwtSecret) as JwtResetPasswordPayload | string;
  } catch (error) {
    if (
      error instanceof TokenExpiredError ||
      error instanceof JsonWebTokenError
    ) {
      const authError = new Error("Token non valido o scaduto") as Error & {
        status?: number;
      };
      authError.status = 401;
      throw authError;
    }

    throw error;
  }

  if (typeof payload === "string" || payload.userId !== userId) {
    const error = new Error("Token non valido per questo utente") as Error & {
      status?: number;
    };
    error.status = 403;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const updatedUser = await updateUserById(userId, {
    password: hashedPassword,
  });

  if (!updatedUser) {
    const error = new Error("Utente non trovato.") as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }
};

export const getAllUsersService = async (): Promise<IUserResponse[]> => {
  const users = await findAllUsers();
  return users.map(mapUserResponse);
};

export const deleteUserService = async (userId: string): Promise<boolean> => {
  const deletedUser = await deleteUserById(userId);
  return !!deletedUser;
};
