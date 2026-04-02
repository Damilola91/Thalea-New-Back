import { getLodgifyPropertyId } from "./lodgifyConfig";
import { lodgifyRequest } from "./lodgifyClient";
import {
  LodgifyAvailabilityItem,
  LodgifyAvailabilityResponse,
  LodgifyOccupiedDatesResponse,
} from "./lodgifyTypes";
import {
  extractOccupiedDatesFromAvailability,
  isValidDateString,
} from "./lodgifyUtils";

export const getLodgifyBookedDates = async (
  startDate: string,
  endDate: string,
): Promise<LodgifyOccupiedDatesResponse> => {
  try {
    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
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

    const response = await lodgifyRequest(url, { method: "GET" });

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

    return {
      occupiedDates: extractOccupiedDatesFromAvailability(data),
      error: null,
    };
  } catch (error) {
    return {
      occupiedDates: [],
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
};

export const checkLodgifyAvailability = async (
  startDate: string,
  endDate: string,
): Promise<LodgifyAvailabilityResponse> => {
  try {
    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      return {
        available: null,
        error: "Formato date non valido. Usa YYYY-MM-DD",
      };
    }

    const url = `https://api.lodgify.com/v2/availability/${getLodgifyPropertyId()}?start=${startDate}&end=${endDate}`;

    const response = await lodgifyRequest(url, { method: "GET" });

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
