import { UserRole } from "./userTypes";

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface UpdatePasswordDto {
  userId: string;
  newPassword: string;
  token: string;
}
