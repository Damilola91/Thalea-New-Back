const mongoose = require("mongoose");

const ApartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    maxGuests: {
      type: Number,
      required: true,
    },
    amenities: {
      type: [String], // es: ["Wi-Fi", "Aria condizionata", "Terrazza"]
      default: [],
    },
    images: {
      type: [String], // URL immagini
      required: true,
    },
    bookedDates: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
  }
);

module.exports = mongoose.model("Apartment", ApartmentSchema);
