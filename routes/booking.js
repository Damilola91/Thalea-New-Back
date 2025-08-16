const express = require("express");
const booking = express.Router();
const BookingModel = require("../models/BookingModel");
const ApartmentModel = require("../models/ApartmentModel");
const sendBookingConfirmationEmail = require("../utils/emailService");
const OrderModel = require("../models/OrderModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

booking.post("/booking/check-availability", async (req, res, next) => {
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
    next(error);
  }
});

booking.post("/booking/complete", async (req, res, next) => {
  try {
    const {
      apartment,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guestsCount,
    } = req.body;

    // Controlli campi obbligatori
    if (
      !apartment ||
      !guestName ||
      !guestEmail ||
      !checkIn ||
      !checkOut ||
      !guestsCount
    ) {
      return res.status(400).json({
        message:
          "I campi obbligatori sono: apartment, guestName, guestEmail, checkIn, checkOut e guestsCount",
      });
    }

    // Verifica che l'appartamento esista
    const apartmentData = await ApartmentModel.findById(apartment);
    if (!apartmentData) {
      return res.status(404).json({ message: "Appartamento non trovato" });
    }

    // Calcolo numero di notti
    const diffTime = new Date(checkOut) - new Date(checkIn);
    const nights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

    // Calcolo prezzo totale
    const totalPrice =
      Math.round(nights * apartmentData.pricePerNight * 100) / 100;

    // Crea la prenotazione senza passare nights e totalPrice dal frontend
    const newBooking = new BookingModel({
      apartment,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestsCount,
      nights,
      totalPrice,
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: "Prenotazione completata con successo",
      booking: savedBooking,
    });
  } catch (error) {
    next(error);
  }
});

booking.post("/booking/confirm", async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Controllo campi obbligatori
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ error: "Dati mancanti nella richiesta" });
    }

    // Recupera l'ordine dal DB
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Ordine non trovato" });
    }

    // Evita conferme doppie
    if (order.status === "paid") {
      return res.status(400).json({ error: "Ordine già pagato" });
    }

    // Recupera il PaymentIntent da Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      return res.status(404).json({ error: "Pagamento non trovato" });
    }

    // Controlla stato del pagamento
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Pagamento non riuscito",
        stripeStatus: paymentIntent.status,
      });
    }

    // Aggiorna lo status dell'ordine
    order.status = "paid";
    await order.save();

    // Recupera la prenotazione associata
    const bookingRecord = await BookingModel.findById(order.bookingId);
    if (!bookingRecord) {
      return res.status(404).json({ error: "Prenotazione non trovata" });
    }

    // Aggiorna lo status della prenotazione
    bookingRecord.status = "confirmed";
    const savedBooking = await bookingRecord.save();

    // Invia email di conferma
    await sendBookingConfirmationEmail(
      savedBooking.guestEmail,
      savedBooking.guestName,
      savedBooking.apartment,
      savedBooking.checkIn,
      savedBooking.checkOut,
      savedBooking.guestsCount,
      savedBooking.totalPrice,
      savedBooking.bookingCode
    );

    // Risposta al client
    res.status(200).json({
      message: "Pagamento completato e prenotazione confermata",
      booking: savedBooking,
      stripeStatus: paymentIntent.status,
    });
  } catch (error) {
    console.error("Errore conferma pagamento:", error);
    next(error);
  }
});

module.exports = booking;
