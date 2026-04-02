import { Router } from "express";
import {
  sendNewsletterController,
  subscribeNewsletterController,
} from "./newsletterController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";

const router = Router();

router.post("/subscribe", subscribeNewsletterController);

router.post(
  "/send-newsletter",
  verifyToken,
  authorizeAdmin,
  sendNewsletterController,
);

export default router;
