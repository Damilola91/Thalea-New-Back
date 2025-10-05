const express = require("express");
const booking = express.Router();
const BookingModel = require("../models/BookingModel");
const ApartmentModel = require("../models/ApartmentModel");
const sendBookingConfirmationEmail = require("../utils/emailService");
const sendBookingNotificationToOwner = require("../utils/sendBookingNotificationToOwner");
const OrderModel = require("../models/OrderModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { checkLodgifyAvailability } = require("../utils/lodgifyService");
const { getLodgifyBookedDates } = require("../utils/getLodgifyBookedDates");
const { createLodgifyBooking } = require("../utils/createLodgifyBooking");
const {
  setBookingAsBookedLodgify,
} = require("../utils/setBookingAsBookedLodgify");

booking.get("/booking", async (req, res, next) => {
  try {
    const bookings = await BookingModel.find().populate("apartment");

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        message: "Nessuna prenotazione trovata",
      });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Errore nel recupero delle prenotazioni:", error);
    next(error);
  }
});

booking.get("/booking/occupied-dates", async (req, res, next) => {
  try {
    const propertyId = process.env.LODGIFY_PROPERTY_ID;
    if (!propertyId) {
      return res.status(500).json({ error: "Property ID not configured" });
    }

    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    const startDate = req.query.start || today.toISOString().split("T")[0];
    const endDate = req.query.end || nextYear.toISOString().split("T")[0];

    // 1️⃣ Date da Lodgify
    const { occupiedDates: lodgifyDates, error: lodgifyError } =
      await getLodgifyBookedDates(startDate, endDate);

    // 2️⃣ Date dal database interno
    const internalBookings = await BookingModel.find({
      status: "confirmed",
      $or: [
        {
          checkIn: { $lt: new Date(endDate) },
          checkOut: { $gt: new Date(startDate) },
        },
      ],
    });

    const internalDates = [];
    internalBookings.forEach((b) => {
      for (
        let d = new Date(b.checkIn);
        d <= b.checkOut; // 👉 includo il giorno di check-out interno
        d.setDate(d.getDate() + 1)
      ) {
        internalDates.push(d.toISOString().split("T")[0]);
      }
    });

    const combinedDates = [...new Set([...lodgifyDates, ...internalDates])];

    res.json({
      occupiedDates: combinedDates.sort(),
      sources: {
        lodgify: lodgifyError ? "error" : "ok",
        internal: "ok",
      },
      errors: lodgifyError ? { lodgify: lodgifyError } : null,
      period: { startDate, endDate },
    });
  } catch (error) {
    console.error("Errore in GET /booking/occupied-dates:", error);
    next(error);
  }
});

booking.post("/booking/check-availability", async (req, res, next) => {
  try {
    const { checkIn, checkOut, guestsCount } = req.body;

    if (!checkIn || !checkOut || !guestsCount) {
      return res.status(400).json({
        message: "checkIn, checkOut e guestsCount sono obbligatori.",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: "checkOut deve essere successivo a checkIn.",
      });
    }

    // Converti le date nel formato YYYY-MM-DD per Lodgify
    const startDate = checkInDate.toISOString().split("T")[0];
    const endDate = checkOutDate.toISOString().split("T")[0];

    // STEP 1: Controlla disponibilità su Lodgify PRIMA di tutto
    console.log("STEP 1 - Controllo Lodgify per periodo:", {
      startDate,
      endDate,
    });

    const lodgifyResult = await checkLodgifyAvailability(startDate, endDate);
    console.log("Risultato controllo Lodgify:", lodgifyResult);

    // Se Lodgify dice che NON è disponibile, fermiamo tutto subito
    if (lodgifyResult.available === false) {
      return res.status(200).json({
        message: "Periodo non disponibile secondo il channel manager Lodgify.",
        available: false,
        source: "lodgify",
        lodgifyData: lodgifyResult.data,
        period: { startDate, endDate },
      });
    }

    // Se c'è stato un errore con Lodgify, logga ma continua
    if (lodgifyResult.available === null) {
      console.warn(
        "ATTENZIONE: Errore controllo Lodgify, continuo con database interno:",
        lodgifyResult.error
      );
    } else {
      console.log(
        "✅ Lodgify dice che il periodo è DISPONIBILE, procedo con controllo interno"
      );
    }

    // STEP 2: Se arriviamo qui, Lodgify ha dato OK (o è in errore), controlliamo il database interno
    const nights = Math.max(
      Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
      1
    );

    // Recupera tutti gli appartamenti che possono ospitare il numero richiesto di ospiti
    const apartments = await ApartmentModel.find({
      maxGuests: { $gte: guestsCount },
    });

    if (!apartments.length) {
      return res.status(404).json({
        message: "Nessun appartamento disponibile per il numero di ospiti.",
        availabilityCheck: {
          lodgify: lodgifyResult.available === null ? "error" : "available",
          internalDatabase: "no_apartments",
          period: { startDate, endDate },
        },
      });
    }

    // Recupera tutte le prenotazioni confermate che si sovrappongono al range
    const confirmedBookings = await BookingModel.find({
      status: "confirmed",
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    // Mappa gli appartamenti con il calcolo totale del prezzo e stato disponibilità
    const results = apartments.map((apartment) => {
      const hasConfirmed = confirmedBookings.some(
        (b) => b.apartment.toString() === apartment._id.toString()
      );

      return {
        apartment,
        nights,
        totalPrice: Math.round(nights * apartment.pricePerNight * 100) / 100,
        guestsCount,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: hasConfirmed ? "unavailable" : "available", // pending considerata disponibile
      };
    });

    // Risposta finale con info sui controlli effettuati
    return res.json({
      results,
      availabilityCheck: {
        lodgify: lodgifyResult.available === null ? "error" : "available",
        internalDatabase: "checked",
        period: { startDate, endDate },
        lodgifyError: lodgifyResult.error || null,
      },
    });
  } catch (error) {
    console.error("Errore in check-availability:", error);
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

    if (
      !apartment ||
      !guestName ||
      !guestEmail ||
      !checkIn ||
      !checkOut ||
      !guestsCount
    ) {
      return res.status(400).json({ message: "Campi obbligatori mancanti" });
    }

    const apartmentData = await ApartmentModel.findById(apartment);
    if (!apartmentData)
      return res.status(404).json({ message: "Appartamento non trovato" });

    const diffTime = new Date(checkOut) - new Date(checkIn);
    const nights = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    const totalPrice =
      Math.round(nights * apartmentData.pricePerNight * 100) / 100;

    // 🔹 PRIMA creo la prenotazione su Lodgify
    const lodgifyBooking = await createLodgifyBooking({
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      guestsCount,
      totalPrice,
    });

    console.log("Lodgify response:", lodgifyBooking);

    // 🔹 POI salvo nel DB direttamente con lodgifyId
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
      lodgifyId: lodgifyBooking,
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: "Prenotazione completata con successo",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Errore generale /booking/complete:", error);
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

    // Evita conferme doppie sull'ordine
    if (order.status === "paid") {
      console.log("⚠️ Ordine già pagato, niente da fare");
      const bookingRecord = await BookingModel.findById(order.bookingId);
      return res.status(200).json({
        message: "Ordine già pagato",
        booking: bookingRecord,
      });
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

    // Evita conferme doppie sul booking
    if (bookingRecord.status === "confirmed") {
      console.log("⚠️ Prenotazione già confermata, niente da fare");
      return res.status(200).json({
        message: "Prenotazione già confermata",
        booking: bookingRecord,
      });
    }

    // Aggiorna lo status della prenotazione
    bookingRecord.status = "confirmed";
    const savedBooking = await bookingRecord.save();

    // Aggiorna Lodgify solo se c'è l'ID
    if (savedBooking.lodgifyId) {
      try {
        await setBookingAsBookedLodgify(savedBooking.lodgifyId);
        console.log("✅ Stato Lodgify aggiornato a 'Booked'");
      } catch (lodgifyError) {
        console.error("❌ Errore aggiornamento Lodgify:", lodgifyError.message);
      }
    } else {
      console.warn("⚠️ Nessun lodgifyId trovato per questa prenotazione");
    }

    // Invia email di conferma
    await Promise.all([
      sendBookingConfirmationEmail(
        savedBooking.guestEmail,
        savedBooking.guestName,
        savedBooking.apartment,
        savedBooking.checkIn,
        savedBooking.checkOut,
        savedBooking.guestsCount,
        savedBooking.totalPrice,
        savedBooking.bookingCode
      ),
      sendBookingNotificationToOwner({
        guestName: savedBooking.guestName,
        guestEmail: savedBooking.guestEmail,
        apartment: savedBooking.apartment,
        checkIn: savedBooking.checkIn,
        checkOut: savedBooking.checkOut,
        guestsCount: savedBooking.guestsCount,
        totalPrice: savedBooking.totalPrice,
        bookingCode: savedBooking.bookingCode,
      }),
    ]);

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

booking.get("/booking/:bookingId", async (req, res, next) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    return res.status(400).send({
      statusCode: 400,
      message: "Booking ID is required",
    });
  }

  try {
    const bookingExist = await BookingModel.findById(bookingId).populate(
      "apartment"
    );
    if (!bookingExist) {
      return res.status(404).send({
        statusCode: 404,
        message: "Booking not found with the given booking ID",
      });
    }

    res.status(200).send(bookingExist);
  } catch (error) {
    next(error);
  }
});

booking.delete("/booking/:apartmentId/:bookingId", async (req, res, next) => {
  try {
    const { apartmentId, bookingId } = req.params;

    // Trova l'appartamento
    const apartment = await ApartmentModel.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ message: "Appartamento non trovato" });
    }

    // Filtra bookedDates rimuovendo la prenotazione corrispondente
    const originalLength = apartment.bookedDates.length;
    apartment.bookedDates = apartment.bookedDates.filter(
      (date) => date._id.toString() !== bookingId
    );

    if (apartment.bookedDates.length === originalLength) {
      return res
        .status(404)
        .json({ message: "Prenotazione non trovata in bookedDates" });
    }

    await apartment.save();

    // Aggiorna lo status della prenotazione a "cancelled"
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Prenotazione non trovata" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      message: "Prenotazione cancellata correttamente",
      bookedDates: apartment.bookedDates,
      bookingStatus: booking.status,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = booking;
