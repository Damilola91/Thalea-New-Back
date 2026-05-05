import { Request, Response, NextFunction } from "express";

const sanitizeString = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  return value.trim();
};

const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;

  const cleaned: any = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "object" && value !== null) {
      cleaned[key] = sanitizeObject(value);
    } else {
      cleaned[key] = sanitizeString(value);
    }
  }

  return cleaned;
};

const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  // SOLO BODY (sicuro)
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

export default sanitizeInput;
