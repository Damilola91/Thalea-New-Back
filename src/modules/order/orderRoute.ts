import { Router } from "express";
import {
  createPaymentOrderController,
  getOrderByIdController,
} from "./orderController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";

const router = Router();

router.post("/pay", createPaymentOrderController);
router.get("/:orderId", verifyToken, authorizeAdmin, getOrderByIdController);

export default router;
