import jwt from "jsonwebtoken";
import { IUserDocument } from "../../modules/user/userTypes";

export const generateToken = (user: IUserDocument): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET mancante nel file .env");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "3h",
    },
  );
};
