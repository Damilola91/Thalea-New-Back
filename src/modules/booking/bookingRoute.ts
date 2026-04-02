import { Router } from "express";
import {
  cancelBookingController,
  checkAvailabilityController,
  completeBookingController,
  confirmBookingController,
  getAllBookingsController,
  getBookingByIdController,
  getOccupiedDatesController,
} from "./bookingController";
import { verifyToken } from "../../middlewares/verifyToken";
import { authorizeAdmin } from "../../middlewares/authorizeAdmin";

const router = Router();

router.get("/", verifyToken, authorizeAdmin, getAllBookingsController);
router.get("/occupied-dates", getOccupiedDatesController);
router.post("/check-availability", checkAvailabilityController);
router.post("/complete", completeBookingController);
router.post("/confirm", confirmBookingController);
router.get(
  "/:bookingId",
  verifyToken,
  authorizeAdmin,
  getBookingByIdController,
);
router.delete(
  "/:apartmentId/:bookingId",
  verifyToken,
  authorizeAdmin,
  cancelBookingController,
);

export default router;
