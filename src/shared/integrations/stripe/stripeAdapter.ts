import { stripe } from "../../../config/stripe";
import {
  CreateStripePaymentIntentParams,
  StripePaymentIntentResult,
} from "./stripeTypes";

export const createStripePaymentIntent = async ({
  amount,
  currency = "eur",
  paymentMethodTypes,
  receiptEmail,
}: CreateStripePaymentIntentParams): Promise<StripePaymentIntentResult> => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method_types: paymentMethodTypes,
    receipt_email: receiptEmail,
  });

  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
  };
};

export const retrieveStripePaymentIntent = async (
  paymentIntentId: string,
): Promise<StripePaymentIntentResult> => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
  };
};
