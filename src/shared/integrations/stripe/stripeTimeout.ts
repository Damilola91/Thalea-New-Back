import { createStripeError } from "./stripeErrors";

export const withStripeTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        createStripeError({
          message: `Stripe operation timeout after ${timeoutMs}ms`,
          code: "STRIPE_TIMEOUT",
          retryable: true,
          status: 504,
        }),
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};
