import { NextFunction, Request, Response } from "express";
import {
  cancelBookingService,
  checkAvailabilityService,
  completeBookingService,
  confirmBookingService,
  getAllBookingsService,
  getBookingByIdService,
  getOccupiedDatesService,
} from "./bookingService";
import {
  CheckAvailabilityDto,
  CompleteBookingDto,
  ConfirmBookingDto,
} from "./bookingDto";

export const getAllBookingsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bookings = await getAllBookingsService();

    res.status(200).json({
      statusCode: 200,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getOccupiedDatesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const startDate =
      typeof req.query.start === "string" ? req.query.start : undefined;
    const endDate =
      typeof req.query.end === "string" ? req.query.end : undefined;

    const result = await getOccupiedDatesService(startDate, endDate);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const checkAvailabilityController = async (
  req: Request<{}, {}, CheckAvailabilityDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await checkAvailabilityService(req.body);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const completeBookingController = async (
  req: Request<{}, {}, CompleteBookingDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const booking = await completeBookingService(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Prenotazione completata con successo",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBookingController = async (
  req: Request<{}, {}, ConfirmBookingDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await confirmBookingService(req.body);

    res.status(200).json({
      statusCode: 200,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByIdController = async (
  req: Request<{ bookingId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await getBookingByIdService(bookingId);

    if (!booking) {
      res.status(404).json({
        statusCode: 404,
        message: "Booking not found with the given booking ID",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBookingController = async (
  req: Request<{ apartmentId: string; bookingId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { apartmentId, bookingId } = req.params;
    const result = await cancelBookingService(apartmentId, bookingId);

    res.status(200).json({
      statusCode: 200,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
