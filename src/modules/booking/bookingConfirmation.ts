import { stripe } from "../../config/stripe";
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
  const [order, paymentIntent] = await Promise.all([
    findRawOrderById(orderId),
    stripe.paymentIntents.retrieve(paymentIntentId),
  ]);

  if (!order) {
    throw createAppError("Ordine non trovato", 404);
  }

  if (!paymentIntent) {
    throw createAppError("Pagamento non trovato", 404);
  }

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

  await Promise.all([
    addApartmentBookedDate(
      booking.apartment.toString(),
      booking._id.toString(),
      booking.checkIn,
      booking.checkOut,
    ),
    booking.lodgifyId
      ? setBookingAsBookedLodgifyService(booking.lodgifyId)
      : Promise.resolve(null),
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
