import { NextFunction, Request, Response } from "express";

interface AppError extends Error {
  status?: number;
  isOperational?: boolean;
}

const errorMiddleware = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = error.status || 500;

  /**
   * LOG ERROR (sempre dettagliato lato server)
   */
  req.log.error(
    {
      err: error,
      statusCode,
      path: req.originalUrl,
      method: req.method,
      isOperational: error.isOperational || false,
    },
    "Unhandled error",
  );

  /**
   * RESPONSE (pulita lato client)
   */
  res.status(statusCode).json({
    statusCode,
    message:
      statusCode >= 500 && !error.isOperational
        ? "Internal server error"
        : error.message || "Error",
  });
};

export default errorMiddleware;
