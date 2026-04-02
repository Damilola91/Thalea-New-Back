import { IUserDocument, IUserResponse } from "./userTypes";

export const mapUserResponse = (user: IUserDocument): IUserResponse => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
