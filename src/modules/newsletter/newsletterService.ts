import { createMailerTransport } from "../../shared/utils/email/createMailerTransport";
import { SendNewsletterDto, SubscribeNewsletterDto } from "./newsletterDto";
import {
  createSubscriber,
  findAllSubscribers,
  findSubscriberByEmail,
} from "./newsletterRepository";
import { ISubscriberDocument, ISubscriberResponse } from "./newsletterTypes";

const mapSubscriberResponse = (
  subscriber: ISubscriberDocument,
): ISubscriberResponse => {
  return {
    id: subscriber._id.toString(),
    email: subscriber.email,
    subscribedAt: subscriber.subscribedAt,
  };
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
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

export const subscribeNewsletterService = async (
  data: SubscribeNewsletterDto,
): Promise<ISubscriberResponse> => {
  const { email } = data;

  if (!email) {
    const error = new Error("Email is required") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const existingSubscriber = await findSubscriberByEmail(email);

  if (existingSubscriber) {
    const error = new Error("Email already subscribed") as Error & {
      status?: number;
    };
    error.status = 409;
    throw error;
  }

  const newSubscriber = await createSubscriber(email);

  await sendEmail({
    to: email,
    subject: "Welcome to Our Newsletter!",
    text: "Thank you for subscribing to our newsletter!",
    html: "<p>Thank you for subscribing to our newsletter!</p>",
  });

  return mapSubscriberResponse(newSubscriber);
};

export const sendNewsletterService = async (data: SendNewsletterDto) => {
  const { subject, text, html } = data;

  if (!subject || (!text && !html)) {
    const error = new Error(
      "Missing required fields: 'subject' or email content",
    ) as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  const subscribers = await findAllSubscribers();

  if (subscribers.length === 0) {
    const error = new Error("No subscribers found") as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const emailPromises = subscribers.map((subscriber) =>
    sendEmail({
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
