import { SendNewsletterDto } from "./newsletterDto";
import { createAppError } from "./newsletterErrors";
import { sendNewsletterEmail } from "./newsletterEmail";
import { findAllSubscribers } from "./newsletterRepository";
import { validateSendNewsletterInput } from "./newsletterValidation";

export const sendNewsletterToSubscribers = async (data: SendNewsletterDto) => {
  validateSendNewsletterInput(data);

  const { subject, text, html } = data;

  const subscribers = await findAllSubscribers();

  if (subscribers.length === 0) {
    throw createAppError("No subscribers found", 400);
  }

  const emailPromises = subscribers.map((subscriber) =>
    sendNewsletterEmail({
      to: subscriber.email,
      subject,
      text,
      html,
    }),
  );

  const results = await Promise.allSettled(emailPromises);

  const successfulEmails = subscribers
    .filter((_, index) => results[index].status === "fulfilled")
    .map((subscriber) => subscriber.email);

  const failedEmails = subscribers
    .filter((_, index) => results[index].status === "rejected")
    .map((subscriber) => subscriber.email);

  return {
    sentTo: successfulEmails.length,
    failedTo: failedEmails,
    recipients: successfulEmails,
  };
};
