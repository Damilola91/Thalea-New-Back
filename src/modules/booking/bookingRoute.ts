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
import { bookingRateLimit } from "../../middlewares/security";

const router = Router();

router.get("/", verifyToken, authorizeAdmin, getAllBookingsController);

router.get("/occupied-dates", bookingRateLimit, getOccupiedDatesController);
router.post(
  "/check-availability",
  bookingRateLimit,
  checkAvailabilityController,
);
router.post("/complete", bookingRateLimit, completeBookingController);
router.post("/confirm", bookingRateLimit, confirmBookingController);

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
