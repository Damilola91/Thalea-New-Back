import { createEmailError } from "./emailErrors";

export const withEmailTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        createEmailError({
          message: `Email send timeout after ${timeoutMs}ms`,
          code: "EMAIL_TIMEOUT",
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
