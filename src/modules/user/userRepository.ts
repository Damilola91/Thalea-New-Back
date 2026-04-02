import UserModel from "./userModel";
import { CreateUserDto, UpdateUserDto } from "./userDto";
import { IUserDocument } from "./userTypes";

export const createUser = async (
  userData: CreateUserDto,
): Promise<IUserDocument> => {
  const newUser = new UserModel(userData);
  return await newUser.save();
};

export const findAllUsers = async (): Promise<IUserDocument[]> => {
  return await UserModel.find().sort({ createdAt: -1 });
};

export const findUserById = async (
  userId: string,
): Promise<IUserDocument | null> => {
  return await UserModel.findById(userId);
};

export const findUserByEmail = async (
  email: string,
): Promise<IUserDocument | null> => {
  return await UserModel.findOne({ email });
};

export const findUserByEmailExcludingUserId = async (
  email: string,
  userId: string,
): Promise<IUserDocument | null> => {
  return await UserModel.findOne({
    email,
    _id: { $ne: userId },
  });
};

export const updateUserById = async (
  userId: string,
  updateData: UpdateUserDto,
): Promise<IUserDocument | null> => {
  return await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};

export const deleteUserById = async (
  userId: string,
): Promise<IUserDocument | null> => {
  return await UserModel.findByIdAndDelete(userId);
};
