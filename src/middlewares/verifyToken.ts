import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../shared/types/jwtPayload";
import { isBlacklisted } from "../shared/auth/tokenBlacklist";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
    token?: string;
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      statusCode: 401,
      message: "Token mancante o formato non valido",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (isBlacklisted(token)) {
    res.status(401).json({
      statusCode: 401,
      message: "Token non valido o scaduto",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    // Salviamo il token grezzo su req per poterlo blacklistare al logout
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({
      statusCode: 401,
      message: "Token non valido o scaduto",
    });
  }
};
