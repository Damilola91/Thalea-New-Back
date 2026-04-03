import { normalizeStripeError } from "./stripeErrors";
import { logStripeError, logStripeEvent } from "./stripeLogger";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const retryStripeOperation = async <T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts: number;
    baseDelayMs: number;
    context?: Record<string, unknown>;
  },
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      logStripeEvent("retry_attempt_started", {
        attempt,
        maxAttempts: options.maxAttempts,
        ...options.context,
      });

      const result = await operation();

      logStripeEvent("retry_attempt_succeeded", {
        attempt,
        maxAttempts: options.maxAttempts,
        ...options.context,
      });

      return result;
    } catch (error) {
      const normalizedError = normalizeStripeError(error);
      lastError = normalizedError;

      logStripeError("retry_attempt_failed", {
        attempt,
        maxAttempts: options.maxAttempts,
        code: normalizedError.code,
        retryable: normalizedError.retryable,
        message: normalizedError.message,
        ...options.context,
      });

      if (!normalizedError.retryable || attempt === options.maxAttempts) {
        throw normalizedError;
      }

      const delayMs = options.baseDelayMs * attempt;
      await sleep(delayMs);
    }
  }

  throw normalizeStripeError(lastError);
};
