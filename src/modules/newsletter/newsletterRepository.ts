import SubscriberModel from "./newsletterModel";
import { ISubscriberDocument } from "./newsletterTypes";

export const findSubscriberByEmail = async (
  email: string,
): Promise<ISubscriberDocument | null> => {
  return await SubscriberModel.findOne({ email });
};

export const createSubscriber = async (
  email: string,
): Promise<ISubscriberDocument> => {
  const newSubscriber = new SubscriberModel({ email });
  return await newSubscriber.save();
};

export const findAllSubscribers = async (): Promise<ISubscriberDocument[]> => {
  return await SubscriberModel.find().sort({ subscribedAt: -1 });
};
