const express = require("express");
const booking = express.Router();
const BookingModel = require("../models/BookingModel");
const ApartmentModel = require("../models/ApartmentModel");

// POST /booking/check-availability
booking.post("/booking/check-availability", async (req, res) => {
  try {
    const { checkIn, checkOut, guestsCount } = req.body;

    if (!checkIn || !checkOut || !guestsCount) {
      return res
        .status(400)
        .json({ message: "checkIn, checkOut e guestsCount sono obbligatori." });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res
        .status(400)
        .json({ message: "checkOut deve essere successivo a checkIn." });
    }

    // Calcolo numero di notti
    const diffTime = checkOutDate - checkInDate;
    const nights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

    // Trova appartamenti disponibili
    const availableApartments = await ApartmentModel.find({
      maxGuests: { $gte: guestsCount },
      bookedDates: {
        $not: {
          $elemMatch: {
            start: { $lt: checkOutDate },
            end: { $gt: checkInDate },
          },
        },
      },
    });

    if (!availableApartments.length) {
      return res.status(404).json({
        message: "Nessun appartamento disponibile per le date selezionate.",
      });
    }

    // Mappa appartamenti con prezzo totale calcolato
    const results = availableApartments.map((apartment) => ({
      apartment,
      nights,
      totalPrice: Math.round(nights * apartment.pricePerNight * 100) / 100,
      guestsCount,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    }));

    return res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore server", error: error.message });
  }
});

module.exports = booking;
