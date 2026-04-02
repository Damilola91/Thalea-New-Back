import { SendNewsletterDto, SubscribeNewsletterDto } from "./newsletterDto";
import { sendNewsletterToSubscribers } from "./newsletterSending";
import { subscribeNewsletterRecord } from "./newsletterSubscription";
import { ISubscriberResponse } from "./newsletterTypes";

export const subscribeNewsletterService = async (
  data: SubscribeNewsletterDto,
): Promise<ISubscriberResponse> => {
  return await subscribeNewsletterRecord(data);
};

export const sendNewsletterService = async (data: SendNewsletterDto) => {
  return await sendNewsletterToSubscribers(data);
};
