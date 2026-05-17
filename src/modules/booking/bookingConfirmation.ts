// bookingConfirmation.ts

import { sendBookingConfirmationEmail } from "../../shared/utils/email/sendBookingConfirmationEmail";
import { sendBookingNotificationToOwner } from "../../shared/utils/email/sendBookingNotificationToOwner";

import {
  addApartmentBookedDate,
  removeApartmentBookedDateByBookingId,
} from "../apartment/apartmentRepository";

import { setBookingAsBookedLodgifyService } from "../lodgify/lodgifyService";

import {
  findRawOrderById,
  updateOrderStatusById,
} from "../order/orderRepository";

import { retrieveStripePaymentIntent } from "../../shared/integrations/stripe/stripeAdapter";

import { createAppError } from "./bookingErrors";

import {
  getApartmentLabelFromBooking,
  mapBookingResponse,
} from "./bookingMapper";

import {
  findBookingById,
  findRawBookingById,
  updateBookingStatusById,
} from "./bookingRepository";

import { IBookingDocument, IBookingResponse } from "./bookingTypes";

export const getValidatedPaymentContext = async (
  paymentIntentId: string,
  orderId: string,
) => {
  const order = await findRawOrderById(orderId);

  if (!order) {
    throw createAppError("Ordine non trovato", 404);
  }

  if (order.status === "failed") {
    throw createAppError("Pagamento fallito", 400);
  }

  if (order.stripePaymentIntentId !== paymentIntentId) {
    throw createAppError("Il paymentIntentId non corrisponde all'ordine", 400);
  }

  const paymentIntent = await retrieveStripePaymentIntent(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw createAppError("Pagamento non riuscito", 400);
  }

  return { order, paymentIntent };
};

export const getAlreadyPaidOrderResult = async (orderId: string) => {
  const existingOrder = await findRawOrderById(orderId);

  if (!existingOrder) {
    throw createAppError("Ordine non trovato", 404);
  }

  if (existingOrder.status !== "paid") {
    return null;
  }

  const bookingRecord = await findRawBookingById(
    existingOrder.bookingId.toString(),
  );

  return {
    message: "Ordine già pagato",
    booking: bookingRecord ? mapBookingResponse(bookingRecord) : null,
  };
};

export const markOrderAsPaid = async (orderId: string) => {
  const updatedOrder = await updateOrderStatusById(orderId, "paid");

  if (!updatedOrder) {
    throw createAppError("Errore aggiornamento ordine", 500);
  }

  return updatedOrder;
};

export const getBookingToConfirm = async (bookingId: string) => {
  const bookingRecord = await findRawBookingById(bookingId);

  if (!bookingRecord) {
    throw createAppError("Prenotazione non trovata", 404);
  }

  return bookingRecord;
};

export const confirmBookingRecord = async (
  booking: IBookingDocument,
): Promise<IBookingDocument> => {
  if (booking.status === "confirmed") {
    return booking;
  }

  const updatedBooking = await updateBookingStatusById(
    booking._id.toString(),
    "confirmed",
  );

  if (!updatedBooking) {
    throw createAppError("Errore aggiornamento prenotazione", 500);
  }

  return updatedBooking;
};

export const finalizeConfirmedBooking = async (
  booking: IBookingDocument,
): Promise<IBookingResponse> => {
  const populatedBooking = await findBookingById(booking._id.toString());

  if (!populatedBooking) {
    throw createAppError("Prenotazione confermata ma non recuperata", 500);
  }

  const apartmentLabel = getApartmentLabelFromBooking(populatedBooking);

  await addApartmentBookedDate(
    booking.apartment.toString(),
    booking._id.toString(),
    booking.checkIn,
    booking.checkOut,
  );

  if (booking.lodgifyId) {
    try {
      await setBookingAsBookedLodgifyService(booking.lodgifyId);
    } catch (error) {
      console.error("Errore sincronizzazione Lodgify:", error);
    }
  }

  const emailResults = await Promise.allSettled([
    sendBookingConfirmationEmail({
      guestEmail: populatedBooking.guestEmail,
      guestName: populatedBooking.guestName,
      apartment: apartmentLabel,
      checkIn: populatedBooking.checkIn,
      checkOut: populatedBooking.checkOut,
      guestsCount: populatedBooking.guestsCount,
      totalPrice: populatedBooking.totalPrice,
      bookingCode: populatedBooking.bookingCode,
    }),

    sendBookingNotificationToOwner({
      guestName: populatedBooking.guestName,
      guestEmail: populatedBooking.guestEmail,
      apartment: apartmentLabel,
      checkIn: populatedBooking.checkIn,
      checkOut: populatedBooking.checkOut,
      guestsCount: populatedBooking.guestsCount,
      totalPrice: populatedBooking.totalPrice,
      bookingCode: populatedBooking.bookingCode,
    }),
  ]);

  for (const result of emailResults) {
    if (result.status === "rejected") {
      console.error("Errore invio email booking:", result.reason);
    }
  }

  return mapBookingResponse(populatedBooking);
};

export const cancelBookingRecord = async (
  apartmentId: string,
  bookingId: string,
) => {
  const booking = await findRawBookingById(bookingId);

  if (!booking) {
    throw createAppError("Prenotazione non trovata", 404);
  }

  if (booking.status === "cancelled") {
    return {
      message: "Prenotazione già cancellata",
      bookingStatus: booking.status,
      booking: mapBookingResponse(booking),
    };
  }

  const [updatedBooking] = await Promise.all([
    updateBookingStatusById(bookingId, "cancelled"),

    removeApartmentBookedDateByBookingId(apartmentId, bookingId),
  ]);

  if (!updatedBooking) {
    throw createAppError("Errore cancellazione prenotazione", 500);
  }

  return {
    message: "Prenotazione cancellata correttamente",

    bookingStatus: updatedBooking.status,

    booking: mapBookingResponse(updatedBooking),
  };
};
