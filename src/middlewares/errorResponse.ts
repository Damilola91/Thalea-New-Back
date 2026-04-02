import { NextFunction, Request, Response } from "express";

const errorMiddleware = (
  error: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(error);

  res.status(error.status || 500).json({
    statusCode: error.status || 500,
    message: error.message || "Internal server error",
  });
};

export default errorMiddleware;
