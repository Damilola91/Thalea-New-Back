import nodemailer from "nodemailer";
import { getEmailConfig } from "./emailConfig";
import { normalizeEmailError } from "./emailErrors";
import { logEmailError, logEmailEvent } from "./emailLogger";
import { retryEmailOperation } from "./emailRetry";
import { withEmailTimeout } from "./emailTimeout";
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

const sendEmailOnce = async ({
  to,
  subject,
  text,
  html,
  from,
}: SendEmailParams): Promise<EmailSendResult> => {
  const { senderEmail, timeoutMs } = getEmailConfig();
  const transporter = createEmailTransport();

  const result = await withEmailTimeout(
    transporter.sendMail({
      from: from || senderEmail,
      to,
      subject,
      text,
      html,
    }),
    timeoutMs,
  );

  return {
    accepted: result.accepted as string[],
    rejected: result.rejected as string[],
    response: result.response,
    messageId: result.messageId,
  };
};

export const sendEmail = async (
  params: SendEmailParams,
): Promise<EmailSendResult> => {
  const { retryMaxAttempts, retryBaseDelayMs } = getEmailConfig();

  logEmailEvent("send_started", {
    to: params.to,
    subject: params.subject,
  });

  try {
    const result = await retryEmailOperation(() => sendEmailOnce(params), {
      maxAttempts: retryMaxAttempts,
      baseDelayMs: retryBaseDelayMs,
      context: {
        to: params.to,
        subject: params.subject,
      },
    });

    logEmailEvent("send_succeeded", {
      to: params.to,
      subject: params.subject,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return result;
  } catch (error) {
    const normalizedError = normalizeEmailError(error);

    logEmailError("send_failed", {
      to: params.to,
      subject: params.subject,
      code: normalizedError.code,
      message: normalizedError.message,
      retryable: normalizedError.retryable,
    });

    throw normalizedError;
  }
};
