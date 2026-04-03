import { stripe } from "../../../config/stripe";
import { normalizeStripeError } from "./stripeErrors";
import { logStripeError, logStripeEvent } from "./stripeLogger";
import { retryStripeOperation } from "./stripeRetry";
import { withStripeTimeout } from "./stripeTimeout";
import {
  CreateStripePaymentIntentParams,
  StripePaymentIntentResult,
} from "./stripeTypes";

const STRIPE_TIMEOUT_MS = Number(process.env.STRIPE_TIMEOUT_MS || 10000);
const STRIPE_RETRY_MAX_ATTEMPTS = Number(
  process.env.STRIPE_RETRY_MAX_ATTEMPTS || 3,
);
const STRIPE_RETRY_BASE_DELAY_MS = Number(
  process.env.STRIPE_RETRY_BASE_DELAY_MS || 1000,
);

const mapPaymentIntentResult = (
  paymentIntent: Awaited<ReturnType<typeof stripe.paymentIntents.create>>,
): StripePaymentIntentResult => {
  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
  };
};

export const createStripePaymentIntent = async ({
  amount,
  currency = "eur",
  paymentMethodTypes,
  receiptEmail,
  idempotencyKey,
}: CreateStripePaymentIntentParams): Promise<StripePaymentIntentResult> => {
  logStripeEvent("create_payment_intent_started", {
    amount,
    currency,
    paymentMethodTypes,
    receiptEmail,
    hasIdempotencyKey: Boolean(idempotencyKey),
  });

  try {
    const paymentIntent = await withStripeTimeout(
      stripe.paymentIntents.create(
        {
          amount,
          currency,
          payment_method_types: paymentMethodTypes,
          receipt_email: receiptEmail,
        },
        idempotencyKey ? { idempotencyKey } : undefined,
      ),
      STRIPE_TIMEOUT_MS,
    );

    const result = mapPaymentIntentResult(paymentIntent);

    logStripeEvent("create_payment_intent_succeeded", {
      paymentIntentId: result.id,
      status: result.status,
      amount,
      currency,
    });

    return result;
  } catch (error) {
    const normalizedError = normalizeStripeError(error);

    logStripeError("create_payment_intent_failed", {
      amount,
      currency,
      receiptEmail,
      code: normalizedError.code,
      message: normalizedError.message,
      retryable: normalizedError.retryable,
    });

    throw normalizedError;
  }
};

export const retrieveStripePaymentIntent = async (
  paymentIntentId: string,
): Promise<StripePaymentIntentResult> => {
  logStripeEvent("retrieve_payment_intent_started", {
    paymentIntentId,
  });

  try {
    const paymentIntent = await retryStripeOperation(
      async () =>
        await withStripeTimeout(
          stripe.paymentIntents.retrieve(paymentIntentId),
          STRIPE_TIMEOUT_MS,
        ),
      {
        maxAttempts: STRIPE_RETRY_MAX_ATTEMPTS,
        baseDelayMs: STRIPE_RETRY_BASE_DELAY_MS,
        context: { paymentIntentId },
      },
    );

    const result = {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    };

    logStripeEvent("retrieve_payment_intent_succeeded", {
      paymentIntentId: result.id,
      status: result.status,
    });

    return result;
  } catch (error) {
    const normalizedError = normalizeStripeError(error);

    logStripeError("retrieve_payment_intent_failed", {
      paymentIntentId,
      code: normalizedError.code,
      message: normalizedError.message,
      retryable: normalizedError.retryable,
    });

    throw normalizedError;
  }
};
