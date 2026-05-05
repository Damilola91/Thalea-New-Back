import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  forgotPasswordController,
  getAllUsersController,
  updatePasswordController,
  updateUserController,
} from "./userController";
import validateUser from "../../middlewares/validateUser";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";
import { authRateLimit } from "../../middlewares/security";

const router = Router();

router.post(
  "/register",
  verifyToken,
  authorizeAdmin,
  validateUser,
  createUserController,
);

router.patch("/:userId", verifyToken, authorizeAdmin, updateUserController);
// Nessun verifyToken — l'utente non è loggato quando resetta la password.
// Il token di reset nel body è la sua autenticazione per questa operazione.
router.patch(
  "/update-password/:userId",
  authRateLimit,
  updatePasswordController,
);

// Risposta generica per evitare email enumeration
router.post("/forgot-password", authRateLimit, forgotPasswordController);

router.get("/", verifyToken, authorizeAdmin, getAllUsersController);

router.delete("/:userId", verifyToken, authorizeAdmin, deleteUserController);

export default router;
