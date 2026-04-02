import { LodgifyAvailabilityItem } from "../../shared/integrations/lodgify/lodgifyTypes";

export const formatLodgifyDate = (date: string): string => {
  return new Date(date).toISOString().split("T")[0];
};

export const isValidDateString = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

export const extractOccupiedDatesFromAvailability = (
  data: LodgifyAvailabilityItem[],
): string[] => {
  const occupiedDates: string[] = [];

  if (!Array.isArray(data) || data.length === 0) {
    return occupiedDates;
  }

  data.forEach((property) => {
    if (!Array.isArray(property.periods)) {
      return;
    }

    property.periods.forEach((period) => {
      const isBooked =
        period.booking_status === "booked" ||
        period.closed_period ||
        period.available === 0;

      if (!isBooked) {
        return;
      }

      const start = new Date(period.start.split("T")[0] + "T12:00:00Z");
      const end = new Date(period.end.split("T")[0] + "T12:00:00Z");

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        occupiedDates.push(d.toISOString().split("T")[0]);
      }
    });
  });

  return [...new Set(occupiedDates)];
};
