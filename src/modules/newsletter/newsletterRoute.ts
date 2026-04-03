import { Router } from "express";
import {
  sendNewsletterController,
  subscribeNewsletterController,
} from "./newsletterController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";
import { newsletterRateLimit } from "../../middlewares/security";

const router = Router();

router.post("/subscribe", newsletterRateLimit, subscribeNewsletterController);

router.post(
  "/send-newsletter",
  verifyToken,
  authorizeAdmin,
  newsletterRateLimit,
  sendNewsletterController,
);

export default router;
