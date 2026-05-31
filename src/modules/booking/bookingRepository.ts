import BookingModel from "./bookingModel";
import { IBookingDocument } from "./bookingTypes";

interface CreateBookingRepositoryData {
  apartment: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  nights: number;
  accommodationPrice: number;
  cleaningFee: number;
  totalPrice: number;
  status?: "pending" | "confirmed" | "cancelled";
  notes?: string;
  bookingCode: string;
  lodgifyId?: number;
}

export const createBooking = async (
  bookingData: CreateBookingRepositoryData,
): Promise<IBookingDocument> => {
  const newBooking = new BookingModel(bookingData);
  return await newBooking.save();
};

export const findAllBookings = async (): Promise<IBookingDocument[]> => {
  return await BookingModel.find()
    .populate("apartment")
    .sort({ createdAt: -1 });
};

export const findBookingById = async (
  bookingId: string,
): Promise<IBookingDocument | null> => {
  return await BookingModel.findById(bookingId).populate("apartment");
};

export const findRawBookingById = async (
  bookingId: string,
): Promise<IBookingDocument | null> => {
  return await BookingModel.findById(bookingId);
};

export const findOverlappingConfirmedBookings = async (
  checkIn: Date,
  checkOut: Date,
): Promise<IBookingDocument[]> => {
  return await BookingModel.find({
    status: "confirmed",
    $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
  });
};

export const findOverlappingBookingsForApartment = async (
  apartmentId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<IBookingDocument[]> => {
  return await BookingModel.find({
    apartment: apartmentId,
    status: "confirmed", // solo confirmed blocca — pending non occupa le date
    $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
  });
};

export const findConfirmedBookingsInRange = async (
  startDate: Date,
  endDate: Date,
): Promise<IBookingDocument[]> => {
  return await BookingModel.find({
    status: "confirmed",
    $or: [{ checkIn: { $lt: endDate }, checkOut: { $gt: startDate } }],
  });
};

export const updateBookingStatusById = async (
  bookingId: string,
  status: "pending" | "confirmed" | "cancelled",
): Promise<IBookingDocument | null> => {
  return await BookingModel.findByIdAndUpdate(
    bookingId,
    { $set: { status } },
    { new: true },
  );
};

// Aggiungi questa funzione a bookingRepository.ts

export const updateBookingLodgifyId = async (
  bookingId: string,
  lodgifyId: number,
): Promise<IBookingDocument | null> => {
  return await BookingModel.findByIdAndUpdate(
    bookingId,
    { $set: { lodgifyId } },
    { new: true },
  );
};
