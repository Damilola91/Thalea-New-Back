import { createAppError } from "./orderErrors";
import { createStripePaymentIntent } from "../../shared/integrations/stripe/stripeAdapter";

export const createStripePaymentIntentForOrder = async (
  amount: number,
  paymentMethod: string,
  receiptEmail?: string,
  idempotencyKey?: string,
) => {
  if (!amount || amount <= 0) {
    throw createAppError("Importo non valido per Stripe", 400);
  }

  return await createStripePaymentIntent({
    amount,
    currency: "eur",
    paymentMethodTypes: [paymentMethod],
    receiptEmail,
    idempotencyKey,
  });
};
