import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createAppError } from "./authErrors";

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const verifyAuthToken = (token: string) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw createAppError("JWT_SECRET non configurato", 500);
  }

  try {
    return jwt.verify(token, jwtSecret) as {
      userId: string;
      name: string;
      email: string;
      role: string;
    };
  } catch {
    throw createAppError("Token non valido", 401);
  }
};
