import { CreateUserDto } from "./userDto";
import { createAppError } from "./userErrors";
import { mapUserResponse } from "./userMapper";
import { createUser, findUserByEmail } from "./userRepository";
import { IUserResponse } from "./userTypes";
import { validateCreateUserInput } from "./userValidation";

export const createUserRecord = async (
  userData: CreateUserDto,
): Promise<IUserResponse> => {
  validateCreateUserInput(userData);

  const existingUser = await findUserByEmail(userData.email);

  if (existingUser) {
    throw createAppError("Email già in uso", 409);
  }

  const createdUser = await createUser(userData);
  return mapUserResponse(createdUser);
};
