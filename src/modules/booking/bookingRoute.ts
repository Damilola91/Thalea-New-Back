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
import sanitizeInput from "../../middlewares/sanitizeInput";

const router = Router();

router.get("/", verifyToken, authorizeAdmin, getAllBookingsController);

/**
 * @openapi
 * /api/bookings/occupied-dates:
 *   get:
 *     tags: [Booking]
 *     summary: Date occupate (Lodgify + DB interno)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista date occupate
 */
router.get("/occupied-dates", bookingRateLimit, getOccupiedDatesController);

/**
 * @openapi
 * /api/bookings/check-availability:
 *   post:
 *     tags: [Booking]
 *     summary: Verifica disponibilità appartamento
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [checkIn, checkOut, guestsCount]
 *             properties:
 *               checkIn: { type: string, format: date }
 *               checkOut: { type: string, format: date }
 *               guestsCount: { type: number }
 *     responses:
 *       200:
 *         description: Risultato disponibilità
 */
router.post(
  "/check-availability",
  bookingRateLimit,
  sanitizeInput,
  checkAvailabilityController,
);

/**
 * @openapi
 * /api/bookings/complete:
 *   post:
 *     tags: [Booking]
 *     summary: Completa una prenotazione (pre-pagamento)
 *     security: []
 *     responses:
 *       201:
 *         description: Prenotazione creata
 */
router.post(
  "/complete",
  bookingRateLimit,
  sanitizeInput,
  completeBookingController,
);

/**
 * @openapi
 * /api/bookings/confirm:
 *   post:
 *     tags: [Booking]
 *     summary: Conferma prenotazione dopo pagamento
 *     security: []
 *     responses:
 *       200:
 *         description: Prenotazione confermata
 */
router.post(
  "/confirm",
  bookingRateLimit,
  sanitizeInput,
  confirmBookingController,
);

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
