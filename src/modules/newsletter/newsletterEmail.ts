import { createMailerTransport } from "../../shared/utils/email/createMailerTransport";

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendNewsletterEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailParams) => {
  const senderEmail = process.env.SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error("SENDER_EMAIL mancante nel file .env");
  }

  const transporter = createMailerTransport();

  return await transporter.sendMail({
    from: senderEmail,
    to,
    subject,
    text,
    html,
  });
};
