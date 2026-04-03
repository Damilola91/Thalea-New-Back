import { UpdatePasswordDto } from "./userDto";
import { createAppError } from "./userErrors";
import { updateUserById } from "./userRepository";
import { hashPassword, verifyResetPasswordToken } from "./userSecurity";
import { updatePasswordSchema } from "./userSchemas";

export const updateUserPasswordRecord = async (
  data: UpdatePasswordDto,
): Promise<void> => {
  const validatedData = updatePasswordSchema.parse(data);

  const { userId, newPassword, token } = validatedData;

  verifyResetPasswordToken(token, userId);

  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await updateUserById(userId, {
    password: hashedPassword,
  });

  if (!updatedUser) {
    throw createAppError("Utente non trovato.", 404);
  }
};
