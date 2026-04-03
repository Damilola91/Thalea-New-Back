export const getEmailConfig = () => {
  const senderEmail = process.env.SENDER_EMAIL;
  const emailPass = process.env.EMAIL_PASS;

  if (!senderEmail || !emailPass) {
    throw new Error("SENDER_EMAIL o EMAIL_PASS mancanti nel file .env");
  }

  return {
    senderEmail,
    emailPass,
    timeoutMs: Number(process.env.EMAIL_TIMEOUT_MS || 10000),
    retryMaxAttempts: Number(process.env.EMAIL_RETRY_MAX_ATTEMPTS || 3),
    retryBaseDelayMs: Number(process.env.EMAIL_RETRY_BASE_DELAY_MS || 1000),
  };
};
