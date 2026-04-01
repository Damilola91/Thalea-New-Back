import { NextFunction, Request, Response } from "express";
import { allowedRoles } from "../modules/user/userTypes";

const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors: string[] = [];

  const { name, role, email, password } = req.body;

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("The email is not valid");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (typeof name !== "string" || !name.trim()) {
    errors.push("Name must be a non-empty string");
  }

  if (
    typeof role !== "string" ||
    !allowedRoles.includes(role as (typeof allowedRoles)[number])
  ) {
    errors.push("Role must be one of: admin, user");
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

export default validateUser;
