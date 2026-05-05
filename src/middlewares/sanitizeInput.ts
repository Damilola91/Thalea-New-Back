import { Request, Response, NextFunction } from "express";

const SUSPICIOUS_PATTERNS = [
  /\$\{/, // template injection
  /\$where/i, // MongoDB operator injection
  /\$gt|\$lt|\$ne|\$in|\$or|\$and/i, // MongoDB query operators
  /<script/i, // XSS
  /javascript:/i, // XSS
];

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    const trimmed = value.trim();

    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        return "";
      }
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === "object") {
    return sanitizeObject(value as Record<string, unknown>);
  }

  return value;
};

const sanitizeObject = (
  obj: Record<string, unknown>,
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Blocca chiavi che iniziano con $ (operatori MongoDB)
    if (key.startsWith("$")) continue;

    sanitized[key] = sanitizeValue(value);
  }

  return sanitized;
};

export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body as Record<string, unknown>);
  }

  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(
      req.query as Record<string, unknown>,
    ) as typeof req.query;
  }

  next();
};
