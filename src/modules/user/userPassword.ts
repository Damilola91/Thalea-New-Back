import { sendPasswordResetEmail } from "../../shared/utils/email/sendPasswordResetEmail";
import { UpdatePasswordDto } from "./userDto";
import { createAppError } from "./userErrors";
import { findUserByEmail, updateUserById } from "./userRepository";
import {
  generateResetToken,
  hashPassword,
  verifyResetPasswordToken,
} from "./userSecurity";
import { forgotPasswordSchema, updatePasswordSchema } from "./userSchemas";

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

export const forgotPasswordRecord = async (email: string): Promise<void> => {
  const validatedData = forgotPasswordSchema.parse({ email });

  const user = await findUserByEmail(validatedData.email);

  // Risposta identica se l'utente esiste o meno — evita email enumeration
  if (!user) {
    return;
  }

  const resetToken = generateResetToken(user._id.toString());

  await sendPasswordResetEmail({
    userEmail: user.email,
    userName: user.name,
    resetToken,
    userId: user._id.toString(),
  });
};
