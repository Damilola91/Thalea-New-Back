import { NextFunction, Request, Response } from "express";
import {
  createUserService,
  deleteUserService,
  getAllUsersService,
  updatePasswordService,
  updateUserService,
} from "./userService";
import { CreateUserDto, UpdateUserDto } from "./userDto";

export const createUserController = async (
  req: Request<{}, {}, CreateUserDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const createdUser = await createUserService(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "User saved successfully",
      user: createdUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (
  req: Request<{ userId: string }, {}, UpdateUserDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const updatedUser = await updateUserService(userId, req.body);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const updatePasswordController = async (
  req: Request<{ userId: string }, {}, { newPassword: string; token: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { newPassword, token } = req.body;

    await updatePasswordService({
      userId,
      newPassword,
      token,
    });

    res.status(200).json({ message: "Password aggiornata con successo!" });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await getAllUsersService();

    if (users.length === 0) {
      res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        statusCode: 400,
        message: "User ID is required",
      });
      return;
    }

    const deleted = await deleteUserService(userId);

    if (!deleted) {
      res.status(404).json({
        statusCode: 404,
        message: "User not found with the given User Id",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
