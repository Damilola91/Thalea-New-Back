import { Router } from "express";
import {
  createOfferController,
  deleteOfferController,
  getAllOffersController,
  getOfferByIdController,
  updateOfferController,
} from "./offerController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";

const router = Router();

router.get("/", getAllOffersController);
router.get("/:offerId", getOfferByIdController);

router.post("/", verifyToken, authorizeAdmin, createOfferController);
router.patch("/:offerId", verifyToken, authorizeAdmin, updateOfferController);
router.delete("/:offerId", verifyToken, authorizeAdmin, deleteOfferController);

export default router;
