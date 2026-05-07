import { RequestHandler } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const helmetMiddleware: RequestHandler = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many requests, please try again later",
  },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many authentication attempts, please try again later",
  },
});

export const bookingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many booking requests, please try again later",
  },
});

export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many payment requests, please try again later",
  },
});

export const newsletterRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many newsletter requests, please try again later",
  },
});

export const stripeWebhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 50, // Stripe può mandare burst di eventi, 50/min è sicuro
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many webhook requests",
  },
});
