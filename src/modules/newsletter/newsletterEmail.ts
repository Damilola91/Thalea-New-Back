import { sendEmail } from "../../shared/integrations/email/emailAdapter";

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
  return await sendEmail({
    to,
    subject,
    text,
    html,
  });
};
