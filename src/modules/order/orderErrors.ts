export type AppError = Error & { status?: number };

export const createAppError = (message: string, status: number): AppError => {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
};
