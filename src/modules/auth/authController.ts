import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import {
  addToBlacklist,
  isBlacklisted,
} from "../../shared/auth/tokenBlacklist";
import { generateToken } from "../../shared/utils/generateToken";
import { findUserById } from "../user/userRepository";
import { LoginDto } from "./authDto";
import { createAppError } from "./authErrors";
import { getAuthenticatedUserFromToken } from "./authSession";
import { loginService } from "./authService";

const isProduction = env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
  path: "/",
};

export const loginController = async (
  req: Request<{}, {}, LoginDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, refreshToken, user } = await loginService(req.body);

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 3 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (decoded?.exp) {
        addToBlacklist(token, decoded.exp * 1000);
      }
    } catch {
      // Token malformato — ignoriamo, i cookie vengono rimossi comunque
    }
  }

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Logout riuscito",
  });
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw createAppError("Refresh token mancante", 401);
    }

    if (isBlacklisted(refreshToken)) {
      throw createAppError("Refresh token non valido", 401);
    }

    let payload: { userId: string; purpose: string };

    try {
      // Verifica con JWT_REFRESH_SECRET dedicato
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        purpose: string;
      };
    } catch {
      throw createAppError("Refresh token non valido o scaduto", 401);
    }

    if (payload.purpose !== "refresh") {
      throw createAppError("Token non valido per questo scopo", 403);
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      throw createAppError("Utente non trovato", 404);
    }

    const newAccessToken = generateToken(user);

    res.cookie("token", newAccessToken, {
      ...cookieOptions,
      maxAge: 3 * 60 * 60 * 1000,
    });

    res.status(200).json({
      statusCode: 200,
      message: "Token rinnovato",
      token: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const meController = (req: Request, res: Response): void => {
  try {
    const token = req.cookies?.token;
    const user = getAuthenticatedUserFromToken(token);

    res.status(200).json({ statusCode: 200, user });
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;

    const message =
      error instanceof Error ? error.message : "Errore interno del server";

    res.status(statusCode).json({ statusCode, message });
  }
};
