import nodemailer from "nodemailer";

export const createMailerTransport = () => {
  const senderEmail = process.env.SENDER_EMAIL;
  const emailPass = process.env.EMAIL_PASS;

  if (!senderEmail || !emailPass) {
    throw new Error("SENDER_EMAIL o EMAIL_PASS mancanti nel file .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: emailPass,
    },
    tls:
      process.env.NODE_ENV !== "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });
};
