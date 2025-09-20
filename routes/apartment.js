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

apartment.get("/lodgify/property", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.lodgify.com/v1/properties/712751",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.LODGIFY_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: true,
        status: response.status,
        message: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Errore chiamata Lodgify:", err);
    res.status(500).json({ error: true, message: "Errore interno server" });
  }
});

apartment.get("/lodgify/availability/:start/:end", async (req, res) => {
  try {
    const { start, end } = req.params;
    console.log("Parametri ricevuti:", { start, end });

    // controllo obbligatorietà
    if (!start || !end) {
      return res.status(400).json({
        error: true,
        message: "I parametri 'start' ed 'end' sono obbligatori (YYYY-MM-DD)",
      });
    }

    // Validazione formato date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        error: true,
        message: "Formato date non valido. Usa YYYY-MM-DD",
      });
    }

    // URL API v2 Lodgify
    const url = `https://api.lodgify.com/v2/availability/712751?start=${start}&end=${end}`;
    console.log("URL costruito:", url);
    console.log("API Key presente:", !!process.env.LODGIFY_API_KEY);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-ApiKey": process.env.LODGIFY_API_KEY, // ✅ header corretto
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = `Errore nella lettura della risposta: ${textError.message}`;
      }

      if (!errorText || errorText.trim() === "") {
        errorText = `Errore HTTP ${response.status}: ${
          response.statusText || "Accesso negato"
        }`;
      }

      console.log("Errore API completo:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: [...response.headers.entries()],
      });

      return res.status(response.status).json({
        error: true,
        status: response.status,
        message: errorText,
      });
    }

    const data = await response.json();
    console.log("Dati ricevuti:", data);
    res.json(data);
  } catch (err) {
    console.error("Errore completo:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({
      error: true,
      message: "Errore interno server",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = apartment;
