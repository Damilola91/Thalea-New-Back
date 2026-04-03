import { UpdateUserDto } from "./userDto";
import { createAppError } from "./userErrors";
import { mapUserResponse } from "./userMapper";
import {
  findUserByEmailExcludingUserId,
  updateUserById,
} from "./userRepository";
import { updateUserSchema } from "./userSchemas";
import { hashPassword } from "./userSecurity";
import { IUserResponse } from "./userTypes";

export const updateUserRecord = async (
  userId: string,
  updateData: UpdateUserDto,
): Promise<IUserResponse | null> => {
  const validatedData = updateUserSchema.parse(updateData);

  const dataToUpdate = { ...validatedData };

  if (dataToUpdate.email) {
    const existingUser = await findUserByEmailExcludingUserId(
      dataToUpdate.email,
      userId,
    );

    if (existingUser) {
      throw createAppError("Email già in uso", 409);
    }
  }

  if (dataToUpdate.password) {
    dataToUpdate.password = await hashPassword(dataToUpdate.password);
  }

  const updatedUser = await updateUserById(userId, dataToUpdate);

  if (!updatedUser) {
    return null;
  }

  return mapUserResponse(updatedUser);
};
