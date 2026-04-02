import { Request, Response, NextFunction } from "express";

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      statusCode: 401,
      message: "Utente non autenticato",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      statusCode: 403,
      message: "Accesso negato: solo admin",
    });
    return;
  }

  next();
};
