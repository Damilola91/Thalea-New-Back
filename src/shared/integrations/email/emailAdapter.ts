import nodemailer from "nodemailer";
import { getEmailConfig } from "./emailConfig";
import { EmailSendResult, SendEmailParams } from "./emailTypes";

const createEmailTransport = () => {
  const { senderEmail, emailPass } = getEmailConfig();

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

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  from,
}: SendEmailParams): Promise<EmailSendResult> => {
  const { senderEmail } = getEmailConfig();
  const transporter = createEmailTransport();

  const result = await transporter.sendMail({
    from: from || senderEmail,
    to,
    subject,
    text,
    html,
  });

  return {
    accepted: result.accepted as string[],
    rejected: result.rejected as string[],
    response: result.response,
    messageId: result.messageId,
  };
};
