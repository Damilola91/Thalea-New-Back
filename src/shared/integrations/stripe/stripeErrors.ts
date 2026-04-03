import { NormalizedStripeError } from "./stripeTypes";

export const createStripeError = ({
  message,
  code,
  retryable,
  status,
  cause,
}: {
  message: string;
  code: string;
  retryable: boolean;
  status: number;
  cause?: unknown;
}): NormalizedStripeError => {
  const error = new Error(message) as NormalizedStripeError;
  error.code = code;
  error.retryable = retryable;
  error.status = status;
  error.cause = cause;
  return error;
};

export const normalizeStripeError = (error: unknown): NormalizedStripeError => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "retryable" in error
  ) {
    return error as NormalizedStripeError;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("timeout") ||
      message.includes("etimedout") ||
      message.includes("econnreset") ||
      message.includes("network")
    ) {
      return createStripeError({
        message: "Stripe network or timeout error",
        code: "STRIPE_NETWORK_ERROR",
        retryable: true,
        status: 503,
        cause: error,
      });
    }

    if (message.includes("authentication") || message.includes("api key")) {
      return createStripeError({
        message: "Stripe authentication failed",
        code: "STRIPE_AUTH_ERROR",
        retryable: false,
        status: 500,
        cause: error,
      });
    }

    if (message.includes("no such payment_intent")) {
      return createStripeError({
        message: "Stripe payment intent not found",
        code: "STRIPE_PAYMENT_INTENT_NOT_FOUND",
        retryable: false,
        status: 404,
        cause: error,
      });
    }

    if (message.includes("rate limit")) {
      return createStripeError({
        message: "Stripe rate limit exceeded",
        code: "STRIPE_RATE_LIMIT",
        retryable: true,
        status: 429,
        cause: error,
      });
    }

    return createStripeError({
      message: error.message || "Unknown Stripe error",
      code: "STRIPE_UNKNOWN_ERROR",
      retryable: false,
      status: 500,
      cause: error,
    });
  }

  return createStripeError({
    message: "Unknown Stripe error",
    code: "STRIPE_UNKNOWN_ERROR",
    retryable: false,
    status: 500,
    cause: error,
  });
};
