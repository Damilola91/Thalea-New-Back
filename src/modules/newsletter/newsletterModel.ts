import { Schema, model } from "mongoose";
import { ISubscriberDocument } from "./newsletterTypes";

const subscriberSchema = new Schema<ISubscriberDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Please provide a valid email address"],
      trim: true,
      lowercase: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    strict: true,
  },
);

const SubscriberModel = model<ISubscriberDocument>(
  "Subscriber",
  subscriberSchema,
);

export default SubscriberModel;
