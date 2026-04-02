import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  updatePasswordController,
  updateUserController,
} from "./userController";
import validateUser from "../../middlewares/validateUser";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";

const router = Router();

router.post(
  "/register",
  verifyToken,
  authorizeAdmin,
  validateUser,
  createUserController,
);

router.patch("/:userId", verifyToken, authorizeAdmin, updateUserController);

router.patch("/update-password/:userId", updatePasswordController);

router.get("/", verifyToken, authorizeAdmin, getAllUsersController);

router.delete("/:userId", verifyToken, authorizeAdmin, deleteUserController);

export default router;
