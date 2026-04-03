export const getEmailConfig = () => {
  const senderEmail = process.env.SENDER_EMAIL;
  const emailPass = process.env.EMAIL_PASS;

  if (!senderEmail || !emailPass) {
    throw new Error("SENDER_EMAIL o EMAIL_PASS mancanti nel file .env");
  }

  return {
    senderEmail,
    emailPass,
  };
};
