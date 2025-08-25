const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const ApartmentModel = require("../models/ApartmentModel"); // Import modello Apartment

const BookingSchema = new mongoose.Schema(
  {
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
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
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: { type: String, trim: true, required: false },
    bookingCode: { type: String, unique: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Pre-save: genera bookingCode, calcola notti e totalPrice
BookingSchema.pre("save", async function (next) {
  // Genera bookingCode se non esiste
  if (!this.bookingCode) {
    this.bookingCode = uuidv4();
  }

  // ⚠️ Controllo sovrapposizione date con Booking esistente
  // ➡️ esclude se stesso dal controllo (quando aggiorno una prenotazione già creata)
  const overlappingBooking = await mongoose.model("Booking").findOne({
    apartment: this.apartment,
    _id: { $ne: this._id }, // 👈 importantissimo
    status: { $ne: "cancelled" },
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

  // Calcolo numero di notti (almeno 1)
  const diffTime = this.checkOut - this.checkIn;
  const nights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  this.nights = nights;

  // Recupera prezzo dell'appartamento
  const apartment = await ApartmentModel.findById(this.apartment);
  if (apartment && apartment.pricePerNight) {
    this.totalPrice = Math.round(nights * apartment.pricePerNight * 100) / 100;
  }

  // Aggiorna bookedDates dell'appartamento SOLO se nuova prenotazione
  if (this.isNew && apartment) {
    apartment.bookedDates.push({
      _id: this._id,
      start: this.checkIn,
      end: this.checkOut,
    });
    await apartment.save();
  }

  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
