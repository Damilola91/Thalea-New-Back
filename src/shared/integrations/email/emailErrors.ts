import { NormalizedEmailError } from "./emailTypes";

export const createEmailError = ({
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
}): NormalizedEmailError => {
  const error = new Error(message) as NormalizedEmailError;
  error.code = code;
  error.retryable = retryable;
  error.status = status;
  error.cause = cause;
  return error;
};

export const normalizeEmailError = (error: unknown): NormalizedEmailError => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "retryable" in error
  ) {
    return error as NormalizedEmailError;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("timeout") ||
      message.includes("etimedout") ||
      message.includes("econnreset") ||
      message.includes("network")
    ) {
      return createEmailError({
        message: "Email provider timeout or network error",
        code: "EMAIL_NETWORK_ERROR",
        retryable: true,
        status: 503,
        cause: error,
      });
    }

    if (
      message.includes("invalid login") ||
      message.includes("auth") ||
      message.includes("authentication")
    ) {
      return createEmailError({
        message: "Email provider authentication failed",
        code: "EMAIL_AUTH_ERROR",
        retryable: false,
        status: 500,
        cause: error,
      });
    }

    return createEmailError({
      message: error.message || "Unknown email error",
      code: "EMAIL_UNKNOWN_ERROR",
      retryable: false,
      status: 500,
      cause: error,
    });
  }

  return createEmailError({
    message: "Unknown email error",
    code: "EMAIL_UNKNOWN_ERROR",
    retryable: false,
    status: 500,
    cause: error,
  });
};
