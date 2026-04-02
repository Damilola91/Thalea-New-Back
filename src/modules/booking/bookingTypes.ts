import { Document, Types } from "mongoose";

export const bookingStatuses = ["pending", "confirmed", "cancelled"] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export interface IBooking {
  apartment: Types.ObjectId;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  bookingCode: string;
  lodgifyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookingDocument extends IBooking, Document {
  _id: Types.ObjectId;
}

export interface IBookingResponse {
  id: string;
  apartment: Types.ObjectId | string | unknown;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  bookingCode: string;
  lodgifyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
