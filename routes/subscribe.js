const express = require("express");
const Subscriber = require("../models/SubscribeModel");
const { Resend } = require("resend");

const resend = new Resend({ apiKey: process.env.RESEND_API_KEY });
const newsletter = express.Router();

// Funzione per inviare email tramite Resend
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log("📨 Tentativo di invio email...");
    console.log("From:", process.env.SENDER_EMAIL);
    console.log("To:", to);
    console.log("Subject:", subject);

    const response = await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email inviata con successo!");
    console.log("Resend response:", JSON.stringify(response, null, 2));

    return response;
  } catch (err) {
    console.error("❌ Errore durante l'invio dell'email:", err.message);
    if (err.response) {
      console.error(
        "Resend API response:",
        JSON.stringify(err.response, null, 2)
      );
    }
    throw new Error(`Failed to send email to ${to}`);
  }
};

// Route per iscrizione alla newsletter
newsletter.post("/subscribe", async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: "Email already subscribed" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({
      statusCode: 201,
      message: "Subscription successful",
      newSubscriber,
    });

    // Log per capire se l’email parte
    console.log(`👉 Invio email di benvenuto a ${email}...`);

    await sendEmail({
      to: email,
      subject: "Welcome to Our Newsletter!",
      text: "Thank you for subscribing to our newsletter!",
      html: "<p>Thank you for subscribing to our newsletter!</p>",
    });
  } catch (error) {
    next(error);
  }
});
// Route per inviare newsletter a tutti i subscriber in parallelo
newsletter.post("/send-newsletter", async (req, res, next) => {
  const { subject, text, html } = req.body;

  if (!subject || (!text && !html)) {
    return res.status(400).json({
      statusCode: 400,
      message: "Missing required fields: 'subject' or email content",
    });
  }

  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "No subscribers found",
      });
    }

    // Creiamo un array di Promises per inviare tutte le email in parallelo
    const emailPromises = subscribers.map((subscriber) =>
      sendEmail({
        to: subscriber.email,
        subject,
        text,
        html,
      })
    );

    // Aspettiamo tutte le email (anche quelle fallite) con allSettled
    const results = await Promise.allSettled(emailPromises);

    const successful = results
      .filter((r) => r.status === "fulfilled")
      .map((_, i) => subscribers[i].email);

    const failed = results
      .filter((r) => r.status === "rejected")
      .map((_, i) => subscribers[i].email);

    res.status(201).json({
      statusCode: 201,
      message: "Newsletter sent",
      result: {
        sentTo: successful.length,
        failedTo: failed,
        recipients: successful,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = newsletter;
