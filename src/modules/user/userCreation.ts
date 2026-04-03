import { CreateUserDto } from "./userDto";
import { createAppError } from "./userErrors";
import { mapUserResponse } from "./userMapper";
import { createUser, findUserByEmail } from "./userRepository";
import { createUserSchema } from "./userSchemas";
import { IUserResponse } from "./userTypes";

export const createUserRecord = async (
  userData: CreateUserDto,
): Promise<IUserResponse> => {
  const validatedData = createUserSchema.parse(userData);

  const existingUser = await findUserByEmail(validatedData.email);

  if (existingUser) {
    throw createAppError("Email già in uso", 409);
  }

  const createdUser = await createUser(validatedData);
  return mapUserResponse(createdUser);
};
