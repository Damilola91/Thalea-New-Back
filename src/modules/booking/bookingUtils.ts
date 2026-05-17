// bookingUtils.ts

import { createAppError } from "./bookingErrors";

const normalizeUtcDate = (date: Date): Date => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const normalizedCheckIn = normalizeUtcDate(checkIn);
  const normalizedCheckOut = normalizeUtcDate(checkOut);

  const diffTime = normalizedCheckOut.getTime() - normalizedCheckIn.getTime();

  return Math.max(diffTime / (1000 * 60 * 60 * 24), 1);
};

export const validateBookingPeriod = (checkIn: Date, checkOut: Date): void => {
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    throw createAppError("Date non valide", 400);
  }

  if (checkOut <= checkIn) {
    throw createAppError("checkOut deve essere successivo a checkIn", 400);
  }
};

export const parseBookingDates = (checkIn: string, checkOut: string) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  validateBookingPeriod(checkInDate, checkOutDate);

  return {
    checkInDate: normalizeUtcDate(checkInDate),
    checkOutDate: normalizeUtcDate(checkOutDate),
  };
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

  const current = normalizeUtcDate(start);
  const checkout = normalizeUtcDate(end);

  while (current < checkout) {
    dates.push(current.toISOString().split("T")[0]);

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};
