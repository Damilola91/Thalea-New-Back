import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
} from "./authController";

const router = Router();

router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", meController);

export default router;
