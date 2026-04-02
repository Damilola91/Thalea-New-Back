import { SubscribeNewsletterDto } from "./newsletterDto";
import { createAppError } from "./newsletterErrors";
import { sendNewsletterEmail } from "./newsletterEmail";
import { mapSubscriberResponse } from "./newsletterMapper";
import {
  createSubscriber,
  findSubscriberByEmail,
} from "./newsletterRepository";
import { ISubscriberResponse } from "./newsletterTypes";
import { validateSubscribeNewsletterInput } from "./newsletterValidation";

export const subscribeNewsletterRecord = async (
  data: SubscribeNewsletterDto,
): Promise<ISubscriberResponse> => {
  validateSubscribeNewsletterInput(data);

  const { email } = data;

  const existingSubscriber = await findSubscriberByEmail(email);

  if (existingSubscriber) {
    throw createAppError("Email already subscribed", 409);
  }

  const newSubscriber = await createSubscriber(email);

  await sendNewsletterEmail({
    to: email,
    subject: "Welcome to Our Newsletter!",
    text: "Thank you for subscribing to our newsletter!",
    html: "<p>Thank you for subscribing to our newsletter!</p>",
  });

  return mapSubscriberResponse(newSubscriber);
};
