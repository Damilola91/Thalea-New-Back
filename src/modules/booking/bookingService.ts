import { v4 as uuidv4 } from "uuid";
import { stripe } from "../../config/stripe";
import { sendBookingConfirmationEmail } from "../../shared/utils/email/sendBookingConfirmationEmail";
import { sendBookingNotificationToOwner } from "../../shared/utils/email/sendBookingNotificationToOwner";
import {
  addApartmentBookedDate,
  findApartmentById,
  findAllApartments,
  removeApartmentBookedDateByBookingId,
} from "../apartment/apartmentRepository";
import {
  checkLodgifyAvailabilityService,
  createLodgifyBookingService,
  getLodgifyBookedDatesService,
  setBookingAsBookedLodgifyService,
} from "../lodgify/lodgifyService";
import OrderModel from "../order/orderModel";
import {
  CheckAvailabilityDto,
  CompleteBookingDto,
  ConfirmBookingDto,
} from "./bookingDto";
import {
  createBooking,
  findAllBookings,
  findBookingById,
  findConfirmedBookingsInRange,
  findOverlappingBookingsForApartment,
  findOverlappingConfirmedBookings,
  findRawBookingById,
  updateBookingStatusById,
} from "./bookingRepository";
import { IBookingDocument, IBookingResponse } from "./bookingTypes";

const mapBookingResponse = (booking: IBookingDocument): IBookingResponse => {
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

const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
};

const getApartmentLabelFromBooking = (booking: IBookingDocument): string => {
  if (
    typeof booking.apartment === "object" &&
    booking.apartment !== null &&
    "name" in booking.apartment
  ) {
    return String(booking.apartment.name);
  }

  return booking.apartment.toString();
};

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
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const resolvedStartDate = startDate || today.toISOString().split("T")[0];
  const resolvedEndDate = endDate || nextYear.toISOString().split("T")[0];

  const [lodgifyResult, internalBookings] = await Promise.all([
    getLodgifyBookedDatesService(resolvedStartDate, resolvedEndDate),
    findConfirmedBookingsInRange(
      new Date(resolvedStartDate),
      new Date(resolvedEndDate),
    ),
  ]);

  const { occupiedDates: lodgifyDates, error: lodgifyError } = lodgifyResult;

  const internalDates: string[] = [];

  internalBookings.forEach((booking) => {
    for (
      let d = new Date(booking.checkIn);
      d <= booking.checkOut;
      d.setDate(d.getDate() + 1)
    ) {
      internalDates.push(d.toISOString().split("T")[0]);
    }
  });

  const combinedDates = [...new Set([...lodgifyDates, ...internalDates])];

  return {
    occupiedDates: combinedDates.sort(),
    sources: {
      lodgify: lodgifyError ? "error" : "ok",
      internal: "ok",
    },
    errors: lodgifyError ? { lodgify: lodgifyError } : null,
    period: {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
    },
  };
};

export const checkAvailabilityService = async (data: CheckAvailabilityDto) => {
  const { checkIn, checkOut, guestsCount } = data;

  if (!checkIn || !checkOut || !guestsCount) {
    const error = new Error(
      "checkIn, checkOut e guestsCount sono obbligatori.",
    ) as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkOutDate <= checkInDate) {
    const error = new Error(
      "checkOut deve essere successivo a checkIn.",
    ) as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const startDate = checkInDate.toISOString().split("T")[0];
  const endDate = checkOutDate.toISOString().split("T")[0];

  const [lodgifyResult, apartments] = await Promise.all([
    checkLodgifyAvailabilityService(startDate, endDate),
    findAllApartments(),
  ]);

  if (lodgifyResult.available === false) {
    return {
      message: "Periodo non disponibile secondo il channel manager Lodgify.",
      available: false,
      source: "lodgify",
      lodgifyData: lodgifyResult.data,
      period: { startDate, endDate },
    };
  }

  const nights = calculateNights(checkInDate, checkOutDate);

  const compatibleApartments = apartments.filter(
    (apartment) => apartment.maxGuests >= guestsCount,
  );

  if (!compatibleApartments.length) {
    return {
      message: "Nessun appartamento disponibile per il numero di ospiti.",
      availabilityCheck: {
        lodgify: lodgifyResult.available === null ? "error" : "available",
        internalDatabase: "no_apartments",
        period: { startDate, endDate },
      },
      results: [],
    };
  }

  const confirmedBookings = await findOverlappingConfirmedBookings(
    checkInDate,
    checkOutDate,
  );

  const results = compatibleApartments.map((apartment) => {
    const hasConfirmed = confirmedBookings.some(
      (booking) => booking.apartment.toString() === apartment._id.toString(),
    );

    return {
      apartment,
      nights,
      totalPrice: Math.round(nights * apartment.pricePerNight * 100) / 100,
      guestsCount,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: hasConfirmed ? "unavailable" : "available",
    };
  });

  return {
    results,
    availabilityCheck: {
      lodgify: lodgifyResult.available === null ? "error" : "available",
      internalDatabase: "checked",
      period: { startDate, endDate },
      lodgifyError: lodgifyResult.error || null,
    },
  };
};

export const completeBookingService = async (data: CompleteBookingDto) => {
  const {
    apartment,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    guestsCount,
    notes,
  } = data;

  if (
    !apartment ||
    !guestName ||
    !guestEmail ||
    !checkIn ||
    !checkOut ||
    !guestsCount
  ) {
    const error = new Error("Campi obbligatori mancanti") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkOutDate <= checkInDate) {
    const error = new Error(
      "checkOut deve essere successivo a checkIn",
    ) as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const [apartmentData, overlappingBookings] = await Promise.all([
    findApartmentById(apartment),
    findOverlappingBookingsForApartment(apartment, checkInDate, checkOutDate),
  ]);

  if (!apartmentData) {
    const error = new Error("Appartamento non trovato") as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }

  if (overlappingBookings.length > 0) {
    const error = new Error(
      "Le date selezionate sono già occupate per questo appartamento.",
    ) as Error & { status?: number };
    error.status = 409;
    throw error;
  }

  const nights = calculateNights(checkInDate, checkOutDate);
  const totalPrice =
    Math.round(nights * apartmentData.pricePerNight * 100) / 100;

  const lodgifyBooking = await createLodgifyBookingService({
    checkIn,
    checkOut,
    guestName,
    guestEmail,
    guestPhone,
    guestsCount,
    totalPrice,
  });

  const savedBooking = await createBooking({
    apartment,
    guestName,
    guestEmail,
    guestPhone,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guestsCount,
    nights,
    totalPrice,
    notes,
    bookingCode: uuidv4(),
    lodgifyId:
      typeof lodgifyBooking === "number"
        ? lodgifyBooking
        : lodgifyBooking?.id || lodgifyBooking?.booking_id,
  });

  return mapBookingResponse(savedBooking);
};

export const confirmBookingService = async (data: ConfirmBookingDto) => {
  const { paymentIntentId, orderId } = data;

  if (!paymentIntentId || !orderId) {
    const error = new Error("Dati mancanti nella richiesta") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const [order, paymentIntent] = await Promise.all([
    OrderModel.findById(orderId),
    stripe.paymentIntents.retrieve(paymentIntentId),
  ]);

  if (!order) {
    const error = new Error("Ordine non trovato") as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }

  if (!paymentIntent) {
    const error = new Error("Pagamento non trovato") as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }

  if (order.status === "paid") {
    const bookingRecord = await findRawBookingById(order.bookingId.toString());

    return {
      message: "Ordine già pagato",
      booking: bookingRecord ? mapBookingResponse(bookingRecord) : null,
    };
  }

  if (paymentIntent.status !== "succeeded") {
    const error = new Error("Pagamento non riuscito") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  order.status = "paid";
  await order.save();

  const bookingRecord = await findRawBookingById(order.bookingId.toString());

  if (!bookingRecord) {
    const error = new Error("Prenotazione non trovata") as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }

  if (bookingRecord.status === "confirmed") {
    return {
      message: "Prenotazione già confermata",
      booking: mapBookingResponse(bookingRecord),
    };
  }

  const updatedBooking = await updateBookingStatusById(
    bookingRecord._id.toString(),
    "confirmed",
  );

  if (!updatedBooking) {
    const error = new Error("Errore aggiornamento prenotazione") as Error & {
      status?: number;
    };
    error.status = 500;
    throw error;
  }

  const populatedUpdatedBooking = await findBookingById(
    updatedBooking._id.toString(),
  );

  if (!populatedUpdatedBooking) {
    const error = new Error(
      "Prenotazione confermata ma non recuperata",
    ) as Error & {
      status?: number;
    };
    error.status = 500;
    throw error;
  }

  const apartmentLabel = getApartmentLabelFromBooking(populatedUpdatedBooking);

  await Promise.all([
    addApartmentBookedDate(
      updatedBooking.apartment.toString(),
      updatedBooking._id.toString(),
      updatedBooking.checkIn,
      updatedBooking.checkOut,
    ),
    updatedBooking.lodgifyId
      ? setBookingAsBookedLodgifyService(updatedBooking.lodgifyId)
      : Promise.resolve(null),
    sendBookingConfirmationEmail({
      guestEmail: populatedUpdatedBooking.guestEmail,
      guestName: populatedUpdatedBooking.guestName,
      apartment: apartmentLabel,
      checkIn: populatedUpdatedBooking.checkIn,
      checkOut: populatedUpdatedBooking.checkOut,
      guestsCount: populatedUpdatedBooking.guestsCount,
      totalPrice: populatedUpdatedBooking.totalPrice,
      bookingCode: populatedUpdatedBooking.bookingCode,
    }),
    sendBookingNotificationToOwner({
      guestName: populatedUpdatedBooking.guestName,
      guestEmail: populatedUpdatedBooking.guestEmail,
      apartment: apartmentLabel,
      checkIn: populatedUpdatedBooking.checkIn,
      checkOut: populatedUpdatedBooking.checkOut,
      guestsCount: populatedUpdatedBooking.guestsCount,
      totalPrice: populatedUpdatedBooking.totalPrice,
      bookingCode: populatedUpdatedBooking.bookingCode,
    }),
  ]);

  return {
    message: "Pagamento completato e prenotazione confermata",
    booking: mapBookingResponse(populatedUpdatedBooking),
    stripeStatus: paymentIntent.status,
  };
};

export const cancelBookingService = async (
  apartmentId: string,
  bookingId: string,
) => {
  const booking = await findRawBookingById(bookingId);

  if (!booking) {
    const error = new Error("Prenotazione non trovata") as Error & {
      status?: number;
    };
    error.status = 404;
    throw error;
  }

  const [updatedBooking] = await Promise.all([
    updateBookingStatusById(bookingId, "cancelled"),
    removeApartmentBookedDateByBookingId(apartmentId, bookingId),
  ]);

  if (!updatedBooking) {
    const error = new Error("Errore cancellazione prenotazione") as Error & {
      status?: number;
    };
    error.status = 500;
    throw error;
  }

  return {
    message: "Prenotazione cancellata correttamente",
    bookingStatus: updatedBooking.status,
    booking: mapBookingResponse(updatedBooking),
  };
};
