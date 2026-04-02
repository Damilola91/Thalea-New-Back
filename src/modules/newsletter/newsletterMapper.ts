import { ISubscriberDocument, ISubscriberResponse } from "./newsletterTypes";

export const mapSubscriberResponse = (
  subscriber: ISubscriberDocument,
): ISubscriberResponse => {
  return {
    id: subscriber._id.toString(),
    email: subscriber.email,
    subscribedAt: subscriber.subscribedAt,
  };
};
