import { Schema, model } from "mongoose";
import { bookingStatuses, IBookingDocument } from "./bookingTypes";

const bookingSchema = new Schema<IBookingDocument>(
  {
    apartment: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
    guestName: { type: String, required: true, trim: true },
    guestEmail: { type: String, required: true, lowercase: true, trim: true },
    guestPhone: { type: String, trim: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guestsCount: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true },
    accommodationPrice: { type: Number, required: true },
    cleaningFee: { type: Number, required: true, default: 35 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: bookingStatuses,
      default: "pending",
    },
    notes: { type: String, trim: true, required: false },
    bookingCode: { type: String, unique: true, required: true },
    lodgifyId: { type: Number, required: false },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const BookingModel = model<IBookingDocument>("Booking", bookingSchema);

export default BookingModel;
