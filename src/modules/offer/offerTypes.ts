import { Document, Types } from "mongoose";

export const allowedOfferTypes = ["discount", "conditional"] as const;
export const allowedDiscountTypes = ["percentage", "fixed"] as const;
export const allowedConditionTypes = [
  "min_nights",
  "early_booking",
  "last_minute",
] as const;

export type OfferType = (typeof allowedOfferTypes)[number];
export type DiscountType = (typeof allowedDiscountTypes)[number];
export type ConditionType = (typeof allowedConditionTypes)[number];

export interface IOffer {
  title: string;
  description?: string;
  type: OfferType;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  apartmentIds?: Types.ObjectId[];
  conditionType?: ConditionType;
  conditionValue?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOfferDocument extends IOffer, Document {
  _id: Types.ObjectId;
}

export interface IOfferResponse {
  id: string;
  title: string;
  description?: string;
  type: OfferType;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  apartmentIds?: string[];
  conditionType?: ConditionType;
  conditionValue?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
