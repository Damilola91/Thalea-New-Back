import { LoginDto } from "./authDto";
import { createAppError } from "./authErrors";

export const validateLoginInput = (data: LoginDto): void => {
  const { email, password } = data;

  if (!email || !password) {
    throw createAppError("Email and password are required", 400);
  }
};
