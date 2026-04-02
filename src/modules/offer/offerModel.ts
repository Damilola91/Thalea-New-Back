import { Schema, model } from "mongoose";
import {
  allowedConditionTypes,
  allowedDiscountTypes,
  allowedOfferTypes,
  IOfferDocument,
} from "./offerTypes";

const offerSchema = new Schema<IOfferDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: allowedOfferTypes,
      required: true,
    },
    discountType: {
      type: String,
      enum: allowedDiscountTypes,
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    apartmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Apartment",
      },
    ],
    conditionType: {
      type: String,
      enum: allowedConditionTypes,
      required: false,
    },
    conditionValue: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const OfferModel = model<IOfferDocument>("Offer", offerSchema);

export default OfferModel;
