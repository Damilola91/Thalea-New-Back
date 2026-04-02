import bcrypt from "bcrypt";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { createAppError } from "./userErrors";
import { JwtResetPasswordPayload } from "./userTypes";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyResetPasswordToken = (
  token: string,
  expectedUserId: string,
): JwtResetPasswordPayload => {
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
      throw createAppError("Token non valido o scaduto", 401);
    }

    throw error;
  }

  if (typeof payload === "string" || payload.userId !== expectedUserId) {
    throw createAppError("Token non valido per questo utente", 403);
  }

  return payload;
};
