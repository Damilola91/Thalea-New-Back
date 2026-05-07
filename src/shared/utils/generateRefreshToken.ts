import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { IUserDocument } from "../../modules/user/userTypes";

export const generateRefreshToken = (user: IUserDocument): string => {
  return jwt.sign(
    { userId: user._id.toString(), purpose: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};
