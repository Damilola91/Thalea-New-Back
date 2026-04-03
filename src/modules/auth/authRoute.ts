import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
} from "./authController";
import { authRateLimit } from "../../middlewares/security";

const router = Router();

router.post("/login", authRateLimit, loginController);
router.post("/logout", authRateLimit, logoutController);
router.get("/me", meController);

export default router;
