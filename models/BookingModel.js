const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const BookingSchema = new mongoose.Schema(
  {
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    guestPhone: {
      type: String,
      trim: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guestsCount: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    bookingCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Pre-save: genera un bookingCode se non esiste
BookingSchema.pre("save", async function (next) {
  if (!this.bookingCode) {
    this.bookingCode = uuidv4();
  }

  // Controllo sovrapposizione date
  const overlappingBooking = await mongoose.model("Booking").findOne({
    apartment: this.apartment,
    status: { $ne: "cancelled" }, // Ignora prenotazioni annullate
    $or: [
      {
        checkIn: { $lt: this.checkOut },
        checkOut: { $gt: this.checkIn },
      },
    ],
  });

  if (overlappingBooking) {
    return next(
      new Error(
        "Le date selezionate sono già occupate per questo appartamento."
      )
    );
  }

  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
