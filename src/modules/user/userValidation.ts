import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from "./userDto";
import { createAppError } from "./userErrors";

export const validateCreateUserInput = (data: CreateUserDto): void => {
  if (!data.name?.trim()) {
    throw createAppError("Il nome è obbligatorio", 400);
  }

  if (!data.email?.trim()) {
    throw createAppError("L'email è obbligatoria", 400);
  }

  if (!data.password || data.password.length < 8) {
    throw createAppError(
      "La password è obbligatoria e deve contenere almeno 8 caratteri",
      400,
    );
  }

  if (!data.role) {
    throw createAppError("Il ruolo è obbligatorio", 400);
  }
};

export const validateUpdateUserInput = (data: UpdateUserDto): void => {
  if (data.password !== undefined && data.password.length < 8) {
    throw createAppError("La password deve contenere almeno 8 caratteri", 400);
  }

  if (data.email !== undefined && !data.email.trim()) {
    throw createAppError("Email non valida", 400);
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw createAppError("Nome non valido", 400);
  }
};

export const validateUpdatePasswordInput = (data: UpdatePasswordDto): void => {
  const { userId, newPassword, token } = data;

  if (!userId) {
    throw createAppError("userId mancante", 400);
  }

  if (!newPassword || newPassword.length < 8) {
    throw createAppError(
      "La nuova password è obbligatoria e deve contenere almeno 8 caratteri.",
      400,
    );
  }

  if (!token) {
    throw createAppError("Token mancante", 401);
  }
};
