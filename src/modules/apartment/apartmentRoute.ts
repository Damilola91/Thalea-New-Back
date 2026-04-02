import { Router } from "express";
import {
  clearApartmentBookedDatesController,
  createApartmentController,
  deleteApartmentController,
  getAllApartmentsController,
  getApartmentByIdController,
  updateApartmentController,
} from "./apartmentController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";

const router = Router();

router.post("/create", verifyToken, authorizeAdmin, createApartmentController);

router.get("/", getAllApartmentsController);
router.get("/:apartmentId", getApartmentByIdController);

router.patch(
  "/update/:apartmentId",
  verifyToken,
  authorizeAdmin,
  updateApartmentController,
);

router.patch(
  "/:apartmentId/clear-booked-dates",
  verifyToken,
  authorizeAdmin,
  clearApartmentBookedDatesController,
);

router.delete(
  "/:apartmentId",
  verifyToken,
  authorizeAdmin,
  deleteApartmentController,
);

export default router;
