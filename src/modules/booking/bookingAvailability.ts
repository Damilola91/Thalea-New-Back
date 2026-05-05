import { findAllApartments } from "../apartment/apartmentRepository";
import {
  checkLodgifyAvailabilityService,
  getLodgifyBookedDatesService,
} from "../lodgify/lodgifyService";
import {
  findConfirmedBookingsInRange,
  findOverlappingConfirmedBookings,
} from "./bookingRepository";
import {
  buildDateRange,
  calculateNights,
  getDatesBetween,
} from "./bookingUtils";

export const buildOccupiedDatesResponse = async (
  startDate?: string,
  endDate?: string,
) => {
  const { resolvedStartDate, resolvedEndDate } = buildDateRange(
    startDate,
    endDate,
  );

  const [lodgifyResult, internalBookings] = await Promise.all([
    getLodgifyBookedDatesService(resolvedStartDate, resolvedEndDate),
    findConfirmedBookingsInRange(
      new Date(resolvedStartDate),
      new Date(resolvedEndDate),
    ),
  ]);

  const { occupiedDates: lodgifyDates, error: lodgifyError } = lodgifyResult;

  const internalDates = internalBookings.flatMap((booking) =>
    getDatesBetween(new Date(booking.checkIn), new Date(booking.checkOut)),
  );

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

export const buildAvailabilityResponse = async (
  checkInDate: Date,
  checkOutDate: Date,
  guestsCount: number,
) => {
  const startDate = checkInDate.toISOString().split("T")[0];
  const endDate = checkOutDate.toISOString().split("T")[0];

  const lodgifyResult = await checkLodgifyAvailabilityService(
    startDate,
    endDate,
  );

  // Lodgify in errore → blocca con unavailable, non continuare
  // Le date potrebbero essere occupate da Booking.com o altri canali
  if (lodgifyResult.available === null) {
    return {
      results: [],
      availabilityCheck: {
        lodgify: "error",
        internalDatabase: "skipped",
        period: { startDate, endDate },
        lodgifyError: lodgifyResult.error ?? "Errore sconosciuto",
      },
      message:
        "Impossibile verificare la disponibilità in questo momento. Riprova tra qualche istante.",
      available: false,
    };
  }

  // Lodgify dice non disponibile → blocca subito senza toccare il DB
  if (lodgifyResult.available === false) {
    return {
      message: "Periodo non disponibile secondo il channel manager Lodgify.",
      available: false,
      source: "lodgify",
      lodgifyData: lodgifyResult.data,
      period: { startDate, endDate },
    };
  }

  // Lodgify ok → verifica anche il DB interno
  const nights = calculateNights(checkInDate, checkOutDate);
  const apartments = await findAllApartments();

  const compatibleApartments = apartments.filter(
    (apartment) => apartment.maxGuests >= guestsCount,
  );

  if (!compatibleApartments.length) {
    return {
      message: "Nessun appartamento disponibile per il numero di ospiti.",
      availabilityCheck: {
        lodgify: "available",
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
      lodgify: "available",
      internalDatabase: "checked",
      period: { startDate, endDate },
    },
  };
};
