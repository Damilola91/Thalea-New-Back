import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  updatePasswordController,
  updateUserController,
} from "./userController";
import validateUser from "../../middlewares/validateUser";

const router = Router();

router.post("/", validateUser, createUserController);
router.patch("/:userId", updateUserController);
router.patch("/update-password/:userId", updatePasswordController);
router.get("/", getAllUsersController);
router.delete("/:userId", deleteUserController);

export default router;
