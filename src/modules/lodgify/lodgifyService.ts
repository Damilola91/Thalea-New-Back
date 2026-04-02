import {
  CreateLodgifyBookingDto,
  LodgifyAvailabilityItem,
  LodgifyAvailabilityResponse,
  LodgifyOccupiedDatesResponse,
} from "./lodgifyTypes";

const getLodgifyApiKey = (): string => {
  const apiKey = process.env.LODGIFY_API_KEY;

  if (!apiKey) {
    throw new Error("LODGIY_API_KEY mancante nel file .env");
  }

  return apiKey;
};

const getLodgifyPropertyId = (): number => {
  const propertyId = process.env.LODGIFY_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("LODGIY_PROPERTY_ID mancante nel file .env");
  }

  return Number(propertyId);
};

const getLodgifyRoomTypeId = (): number => {
  const roomTypeId = process.env.LODGIFY_ROOM_TYPE_ID;

  if (!roomTypeId) {
    throw new Error("LODGIY_ROOM_TYPE_ID mancante nel file .env");
  }

  return Number(roomTypeId);
};

const formatDate = (date: string): string => {
  return new Date(date).toISOString().split("T")[0];
};

export const createLodgifyBookingService = async (
  data: CreateLodgifyBookingDto,
): Promise<any> => {
  const url = "https://api.lodgify.com/v1/reservation/booking";

  const body = {
    source_text: "Direct Booking (API)",
    arrival: formatDate(data.checkIn),
    departure: formatDate(data.checkOut),
    property_id: getLodgifyPropertyId(),
    status: "Tentative",
    bookability: "InstantBooking",
    rooms: [
      {
        room_type_id: getLodgifyRoomTypeId(),
        quantity: 1,
        adults: data.guestsCount,
      },
    ],
    guest: {
      name: data.guestName,
      first_name: data.guestName.split(" ")[0] || data.guestName,
      last_name: data.guestName.split(" ").slice(1).join(" ") || data.guestName,
      email: data.guestEmail,
      phone: data.guestPhone || null,
    },
    total: data.totalPrice,
    currency_code: "EUR",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-ApiKey": getLodgifyApiKey(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Errore Lodgify: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getLodgifyBookedDatesService = async (
  startDate: string,
  endDate: string,
): Promise<LodgifyOccupiedDatesResponse> => {
  try {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        occupiedDates: [],
        error: "Formato date non valido. Usa YYYY-MM-DD",
      };
    }

    const propertyId = getLodgifyPropertyId();
    const startISO = `${startDate}T00:00:00Z`;
    const endISO = `${endDate}T23:59:59Z`;

    const url = `https://api.lodgify.com/v2/availability/${propertyId}?start=${encodeURIComponent(
      startISO,
    )}&end=${encodeURIComponent(endISO)}&includeDetails=true`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-ApiKey": getLodgifyApiKey(),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const message =
        errorText && errorText.trim() !== ""
          ? errorText
          : `Errore HTTP ${response.status}: ${
              response.statusText || "Accesso negato"
            }`;

      return {
        occupiedDates: [],
        error: message,
        status: response.status,
      };
    }

    const data = (await response.json()) as LodgifyAvailabilityItem[];
    const occupiedDates: string[] = [];

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((property) => {
        if (Array.isArray(property.periods)) {
          property.periods.forEach((period) => {
            const isBooked =
              period.booking_status === "booked" ||
              period.closed_period ||
              period.available === 0;

            if (isBooked) {
              const start = new Date(period.start.split("T")[0] + "T12:00:00Z");
              const end = new Date(period.end.split("T")[0] + "T12:00:00Z");

              for (
                let d = new Date(start);
                d <= end;
                d.setDate(d.getDate() + 1)
              ) {
                occupiedDates.push(d.toISOString().split("T")[0]);
              }
            }
          });
        }
      });
    }

    return {
      occupiedDates: [...new Set(occupiedDates)],
      error: null,
    };
  } catch (error) {
    return {
      occupiedDates: [],
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
};

export const checkLodgifyAvailabilityService = async (
  startDate: string,
  endDate: string,
): Promise<LodgifyAvailabilityResponse> => {
  try {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        available: null,
        error: "Formato date non valido. Usa YYYY-MM-DD",
      };
    }

    const url = `https://api.lodgify.com/v2/availability/${getLodgifyPropertyId()}?start=${startDate}&end=${endDate}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-ApiKey": getLodgifyApiKey(),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const message =
        errorText && errorText.trim() !== ""
          ? errorText
          : `Errore HTTP ${response.status}: ${
              response.statusText || "Accesso negato"
            }`;

      return {
        available: null,
        error: message,
        status: response.status,
      };
    }

    const data = (await response.json()) as LodgifyAvailabilityItem[];

    let isAvailable = true;

    if (Array.isArray(data) && data.length > 0) {
      isAvailable = data.every((property) => {
        if (!property.periods || !Array.isArray(property.periods)) {
          return false;
        }

        return property.periods.every((period) => {
          return period.available === 1 && !period.closed_period;
        });
      });
    } else {
      isAvailable = false;
    }

    return {
      available: isAvailable,
      data,
    };
  } catch (error) {
    return {
      available: null,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
};

export const setBookingAsBookedLodgifyService = async (
  lodgifyBookingId: number,
): Promise<any> => {
  const response = await fetch(
    `https://api.lodgify.com/v1/reservation/booking/${lodgifyBookingId}/book?requestPayment=false`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-ApiKey": getLodgifyApiKey(),
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Errore Lodgify (${response.status}): ${JSON.stringify(errorData)}`,
    );
  }

  return await response.json().catch(() => ({}));
};
