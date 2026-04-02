import { stripe } from "../../config/stripe";
import { createAppError } from "./orderErrors";

export const createStripePaymentIntentForOrder = async (
  amount: number,
  paymentMethod: string,
  receiptEmail?: string,
) => {
  if (!amount || amount <= 0) {
    throw createAppError("Importo non valido per Stripe", 400);
  }

  return await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    payment_method_types: [paymentMethod],
    receipt_email: receiptEmail,
  });
};
