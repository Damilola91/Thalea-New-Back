import {
  CheckAvailabilityDto,
  CompleteBookingDto,
  ConfirmBookingDto,
} from "./bookingDto";
import { createAppError } from "./bookingErrors";

export const validateAvailabilityInput = (data: CheckAvailabilityDto): void => {
  const { checkIn, checkOut, guestsCount } = data;

  if (!checkIn || !checkOut || !guestsCount) {
    throw createAppError(
      "checkIn, checkOut e guestsCount sono obbligatori.",
      400,
    );
  }
};

export const validateCompleteBookingInput = (
  data: CompleteBookingDto,
): void => {
  const { apartment, guestName, guestEmail, checkIn, checkOut, guestsCount } =
    data;

  if (
    !apartment ||
    !guestName ||
    !guestEmail ||
    !checkIn ||
    !checkOut ||
    !guestsCount
  ) {
    throw createAppError("Campi obbligatori mancanti", 400);
  }
};

export const validateConfirmBookingInput = (data: ConfirmBookingDto): void => {
  const { paymentIntentId, orderId } = data;

  if (!paymentIntentId || !orderId) {
    throw createAppError("Dati mancanti nella richiesta", 400);
  }
};
