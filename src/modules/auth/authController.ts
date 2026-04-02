import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { LoginDto } from "./authDto";
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
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({
      statusCode: 401,
      message: "Non autenticato",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      statusCode: 500,
      message: "JWT_SECRET non configurato",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      name: string;
      email: string;
      role: string;
    };

    res.status(200).json({
      statusCode: 200,
      user: {
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch {
    res.status(401).json({
      statusCode: 401,
      message: "Token non valido",
    });
  }
};
