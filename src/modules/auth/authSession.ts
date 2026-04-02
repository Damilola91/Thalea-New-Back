import { createAppError } from "./authErrors";
import { verifyAuthToken } from "./authSecurity";

export const getAuthenticatedUserFromToken = (token?: string) => {
  if (!token) {
    throw createAppError("Non autenticato", 401);
  }

  const decoded = verifyAuthToken(token);

  return {
    id: decoded.userId,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role,
  };
};
