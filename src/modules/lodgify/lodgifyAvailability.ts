import { getLodgifyPropertyId } from "./lodgifyConfig";
import { lodgifyRequest } from "./lodgifyClient";
import {
  LodgifyAvailabilityItem,
  LodgifyAvailabilityResponse,
  LodgifyOccupiedDatesResponse,
} from "../../shared/integrations/lodgify/lodgifyTypes";
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

    // lodgifyRequest restituisce già il JSON parsato — non è una Response di fetch
    const data = (await lodgifyRequest(url, {
      method: "GET",
    })) as LodgifyAvailabilityItem[];

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

    // lodgifyRequest restituisce già il JSON parsato
    const data = (await lodgifyRequest(url, {
      method: "GET",
    })) as LodgifyAvailabilityItem[];

    if (!Array.isArray(data) || data.length === 0) {
      return { available: false, data: [] };
    }

    const isAvailable = data.every((property) => {
      if (!property.periods || !Array.isArray(property.periods)) {
        return false;
      }

      return property.periods.every(
        (period) => period.available === 1 && !period.closed_period,
      );
    });

    return { available: isAvailable, data };
  } catch (error) {
    return {
      available: null,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
};
