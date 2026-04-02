import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY mancante nel file .env");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: (process.env.STRIPE_API_VERSION ||
    "2025-02-24.acacia") as Stripe.LatestApiVersion,
});
