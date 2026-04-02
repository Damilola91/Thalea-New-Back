import { UpdatePasswordDto } from "./userDto";
import { createAppError } from "./userErrors";
import { updateUserById } from "./userRepository";
import { hashPassword, verifyResetPasswordToken } from "./userSecurity";
import { validateUpdatePasswordInput } from "./userValidation";

export const updateUserPasswordRecord = async (
  data: UpdatePasswordDto,
): Promise<void> => {
  validateUpdatePasswordInput(data);

  const { userId, newPassword, token } = data;

  verifyResetPasswordToken(token, userId);

  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await updateUserById(userId, {
    password: hashedPassword,
  });

  if (!updatedUser) {
    throw createAppError("Utente non trovato.", 404);
  }
};
