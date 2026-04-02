import { NextFunction, Request, Response } from "express";
import { LoginDto } from "./authDto";
import { getAuthenticatedUserFromToken } from "./authSession";
import { loginService } from "./authService";

export const loginController = async (
  req: Request<{}, {}, LoginDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, user } = await loginService(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 3 * 60 * 60 * 1000,
      path: "/",
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

export const logoutController = (_req: Request, res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Logout riuscito",
  });
};

export const meController = (req: Request, res: Response): void => {
  try {
    const token = req.cookies?.token;
    const user = getAuthenticatedUserFromToken(token);

    res.status(200).json({
      statusCode: 200,
      user,
    });
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

    res.status(statusCode).json({
      statusCode,
      message,
    });
  }
};
