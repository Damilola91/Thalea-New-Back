import { v4 as uuidv4 } from "uuid";
import { findApartmentById } from "../apartment/apartmentRepository";
import { CompleteBookingDto } from "./bookingDto";
import { createAppError } from "./bookingErrors";
import { mapBookingResponse } from "./bookingMapper";
import {
  createBooking,
  findOverlappingBookingsForApartment,
} from "./bookingRepository";
import { completeBookingSchema } from "./bookingSchemas";
import { IBookingResponse } from "./bookingTypes";
import {
  calculateNights,
  calculateTotalPrice,
  parseBookingDates,
} from "./bookingUtils";

// Nota: la creazione su Lodgify avviene DOPO il pagamento
// nel webhook Stripe (stripeWebhookHandler.ts → finalizeConfirmedBooking)

export const createPendingBookingRecord = async (
  data: CompleteBookingDto,
): Promise<IBookingResponse> => {
  const validatedData = completeBookingSchema.parse(data);

  const {
    apartment,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    guestsCount,
    notes,
  } = validatedData;

  const { checkInDate, checkOutDate } = parseBookingDates(checkIn, checkOut);

  const [apartmentData, overlappingBookings] = await Promise.all([
    findApartmentById(apartment),
    findOverlappingBookingsForApartment(apartment, checkInDate, checkOutDate),
  ]);

  if (!apartmentData) {
    throw createAppError("Appartamento non trovato", 404);
  }

  if (overlappingBookings.length > 0) {
    throw createAppError(
      "Le date selezionate sono già occupate per questo appartamento.",
      409,
    );
  }

  const nights = calculateNights(checkInDate, checkOutDate);
  const { accommodationPrice, cleaningFee, totalPrice } = calculateTotalPrice(
    nights,
    apartmentData.pricePerNight,
  );

  const savedBooking = await createBooking({
    apartment,
    guestName,
    guestEmail,
    guestPhone,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guestsCount,
    nights,
    accommodationPrice,
    cleaningFee,
    totalPrice,
    notes,
    bookingCode: uuidv4(),
  });

  return mapBookingResponse(savedBooking);
};
