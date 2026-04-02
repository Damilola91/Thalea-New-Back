import { Request, Response } from "express";

const notFoundMiddleware = (_req: Request, res: Response): void => {
  res.status(404).json({
    statusCode: 404,
    message: "Route not found",
  });
};

export default notFoundMiddleware;
