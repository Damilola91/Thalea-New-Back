import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../shared/types/jwtPayload";
import { createAppError } from "./authErrors";

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const verifyAuthToken = (token: string): JwtPayload => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw createAppError("JWT_SECRET non configurato", 500);
  }

  try {
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch {
    throw createAppError("Token non valido", 401);
  }
};
