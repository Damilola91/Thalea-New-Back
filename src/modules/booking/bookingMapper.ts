import { IBookingDocument, IBookingResponse } from "./bookingTypes";

export const mapBookingResponse = (
  booking: IBookingDocument,
): IBookingResponse => {
  return {
    id: booking._id.toString(),
    apartment: booking.apartment,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guestsCount: booking.guestsCount,
    nights: booking.nights,
    totalPrice: booking.totalPrice,
    status: booking.status,
    notes: booking.notes,
    bookingCode: booking.bookingCode,
    lodgifyId: booking.lodgifyId,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};

export const getApartmentLabelFromBooking = (
  booking: IBookingDocument,
): string => {
  if (
    typeof booking.apartment === "object" &&
    booking.apartment !== null &&
    "name" in booking.apartment
  ) {
    return String(booking.apartment.name);
  }

  return booking.apartment.toString();
};
