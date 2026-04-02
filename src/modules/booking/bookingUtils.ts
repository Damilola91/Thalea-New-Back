import { createAppError } from "./bookingErrors";

export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
};

export const validateBookingPeriod = (checkIn: Date, checkOut: Date): void => {
  if (checkOut <= checkIn) {
    throw createAppError("checkOut deve essere successivo a checkIn", 400);
  }
};

export const parseBookingDates = (checkIn: string, checkOut: string) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  validateBookingPeriod(checkInDate, checkOutDate);

  return { checkInDate, checkOutDate };
};

export const buildDateRange = (startDate?: string, endDate?: string) => {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  return {
    resolvedStartDate: startDate || today.toISOString().split("T")[0],
    resolvedEndDate: endDate || nextYear.toISOString().split("T")[0],
  };
};

export const getDatesBetween = (start: Date, end: Date): string[] => {
  const dates: string[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
};
