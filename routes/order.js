const express = require("express");
const order = express.Router();
const OrderModel = require("../models/OrderModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const BookingModel = require("../models/BookingModel");

const enumPaymentMethod = ["card"];

order.post("/pay", async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    // Controllo paymentMethod
    if (!enumPaymentMethod.includes(paymentMethod)) {
      return res.status(400).json({ error: "Metodo di pagamento non valido" });
    }

    // Controllo bookingId
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Prenotazione non trovata" });
    }

    if (!booking.totalPrice || booking.totalPrice <= 0) {
      return res.status(400).json({ error: "Il prezzo totale non è valido" });
    }

    // Trasformiamo l'importo in centesimi per Stripe
    const amount = Math.round(parseFloat(booking.totalPrice.toString()) * 100);

    const receiptEmail = booking.guestEmail; // email del guest

    // Creazione PaymentIntent su Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: [paymentMethod],
      receipt_email: receiptEmail,
    });

    // Creazione ordine nel DB
    const newOrder = new OrderModel({
      bookingId,
      amount: booking.totalPrice,
      currency: "EUR",
      paymentMethod,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Pagamento in corso...",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      orderId: savedOrder._id,
      stripeStatus: paymentIntent.status,
      savedOrder,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = order;
