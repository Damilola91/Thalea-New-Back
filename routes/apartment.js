const express = require("express");
const apartment = express.Router();
const ApartmentModel = require("../models/ApartmentModel");

apartment.post("/apartment/create", async (req, res, next) => {
  try {
    // Destructuring del body
    const {
      name,
      description,
      address,
      pricePerNight,
      maxGuests,
      amenities = [],
      images = [],
      bookedDates = [],
    } = req.body;

    // Controlli sui campi obbligatori
    if (
      !name ||
      !description ||
      !address ||
      !pricePerNight ||
      !maxGuests ||
      images.length === 0
    ) {
      return res.status(400).json({
        message:
          "I campi obbligatori sono: name, description, address, pricePerNight, maxGuests e almeno un'immagine",
      });
    }

    // Creazione nuovo appartamento
    const newApartment = new ApartmentModel({
      name,
      description,
      address,
      pricePerNight,
      maxGuests,
      amenities,
      images,
      bookedDates,
    });

    await newApartment.save();

    res.status(201).json({
      message: "Appartamento creato con successo",
      apartment: newApartment,
    });
  } catch (error) {
    next(error);
  }
});

apartment.patch(
  "/apartment/:apartmentId/clear-booked-dates",
  async (req, res, next) => {
    try {
      const { apartmentId } = req.params;

      const updatedAparment = await ApartmentModel.findByIdAndUpdate(
        apartmentId,
        { $set: { bookedDates: [] } },
        { new: true }
      );

      if (!updatedAparment) {
        return res.status(404).json({ message: "Appartmaneto non trovato" });
      }

      res.status(200).json({
        message: "Tutte le date prenotate sono state cancellate",
        apartment: updatedAparment,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = apartment;
