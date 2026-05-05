import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from "./userDto";
import { createUserRecord } from "./userCreation";
import { forgotPasswordRecord, updateUserPasswordRecord } from "./userPassword";
import { mapUserResponse } from "./userMapper";
import { deleteUserById, findAllUsers } from "./userRepository";
import { IUserResponse } from "./userTypes";
import { updateUserRecord } from "./userUpdate";

export const createUserService = async (
  userData: CreateUserDto,
): Promise<IUserResponse> => {
  return await createUserRecord(userData);
};

export const updateUserService = async (
  userId: string,
  updateData: UpdateUserDto,
): Promise<IUserResponse | null> => {
  return await updateUserRecord(userId, updateData);
};

export const updatePasswordService = async (
  data: UpdatePasswordDto,
): Promise<void> => {
  await updateUserPasswordRecord(data);
};

export const forgotPasswordService = async (email: string): Promise<void> => {
  await forgotPasswordRecord(email);
};

export const getAllUsersService = async (): Promise<IUserResponse[]> => {
  const users = await findAllUsers();
  return users.map(mapUserResponse);
};

export const deleteUserService = async (userId: string): Promise<boolean> => {
  const deletedUser = await deleteUserById(userId);
  return !!deletedUser;
};
