import { env } from "../../../config/env";

export const getEmailConfig = () => {
  return {
    senderEmail: env.SENDER_EMAIL,
    emailPass: env.EMAIL_PASS,
    timeoutMs: env.EMAIL_TIMEOUT_MS,
    retryMaxAttempts: env.EMAIL_RETRY_MAX_ATTEMPTS,
    retryBaseDelayMs: env.EMAIL_RETRY_BASE_DELAY_MS,
  };
};
