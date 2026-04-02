import {
  buildAvailabilityResponse,
  buildOccupiedDatesResponse,
} from "./bookingAvailability";
import {
  cancelBookingRecord,
  confirmBookingRecord,
  finalizeConfirmedBooking,
  getAlreadyPaidOrderResult,
  getBookingToConfirm,
  getValidatedPaymentContext,
  markOrderAsPaid,
} from "./bookingConfirmation";
import { createPendingBookingRecord } from "./bookingCreation";
import {
  CheckAvailabilityDto,
  CompleteBookingDto,
  ConfirmBookingDto,
} from "./bookingDto";
import { mapBookingResponse } from "./bookingMapper";
import { findAllBookings, findBookingById } from "./bookingRepository";
import { IBookingResponse } from "./bookingTypes";
import { parseBookingDates } from "./bookingUtils";
import {
  validateAvailabilityInput,
  validateConfirmBookingInput,
} from "./bookingValidation";

export const getAllBookingsService = async (): Promise<IBookingResponse[]> => {
  const bookings = await findAllBookings();
  return bookings.map(mapBookingResponse);
};

export const getBookingByIdService = async (
  bookingId: string,
): Promise<IBookingResponse | null> => {
  const booking = await findBookingById(bookingId);

  if (!booking) {
    return null;
  }

  return mapBookingResponse(booking);
};

export const getOccupiedDatesService = async (
  startDate?: string,
  endDate?: string,
) => {
  return await buildOccupiedDatesResponse(startDate, endDate);
};

export const checkAvailabilityService = async (data: CheckAvailabilityDto) => {
  validateAvailabilityInput(data);

  const { checkIn, checkOut, guestsCount } = data;
  const { checkInDate, checkOutDate } = parseBookingDates(checkIn, checkOut);

  return await buildAvailabilityResponse(
    checkInDate,
    checkOutDate,
    guestsCount,
  );
};

export const completeBookingService = async (
  data: CompleteBookingDto,
): Promise<IBookingResponse> => {
  return await createPendingBookingRecord(data);
};

export const confirmBookingService = async (data: ConfirmBookingDto) => {
  validateConfirmBookingInput(data);

  const { paymentIntentId, orderId } = data;

  const alreadyPaidResult = await getAlreadyPaidOrderResult(orderId);

  if (alreadyPaidResult) {
    return alreadyPaidResult;
  }

  const { order, paymentIntent } = await getValidatedPaymentContext(
    paymentIntentId,
    orderId,
  );

  await markOrderAsPaid(orderId);

  const bookingRecord = await getBookingToConfirm(order.bookingId.toString());

  if (bookingRecord.status === "confirmed") {
    return {
      message: "Prenotazione già confermata",
      booking: mapBookingResponse(bookingRecord),
    };
  }

  const confirmedBooking = await confirmBookingRecord(bookingRecord);
  const finalizedBooking = await finalizeConfirmedBooking(confirmedBooking);

  return {
    message: "Pagamento completato e prenotazione confermata",
    booking: finalizedBooking,
    stripeStatus: paymentIntent.status,
  };
};

export const cancelBookingService = async (
  apartmentId: string,
  bookingId: string,
) => {
  return await cancelBookingRecord(apartmentId, bookingId);
};
