export type AppError = Error & { status?: number; isOperational?: boolean };

export const createAppError = (
  message: string,
  status: number,
  isOperational = true,
): AppError => {
  const error = new Error(message) as AppError;
  error.status = status;
  error.isOperational = isOperational;
  return error;
};
