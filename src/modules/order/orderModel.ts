import { Schema, model } from "mongoose";
import {
  allowedCurrencies,
  allowedOrderStatuses,
  allowedPaymentMethods,
  IOrderDocument,
} from "./orderTypes";

const orderSchema = new Schema<IOrderDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      enum: allowedCurrencies,
      default: "EUR",
    },
    paymentMethod: {
      type: String,
      enum: allowedPaymentMethods,
      required: true,
    },
    status: {
      type: String,
      enum: allowedOrderStatuses,
      default: "pending",
    },
    transactionId: {
      type: String,
      required: false,
    },
    stripePaymentIntentId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

const OrderModel = model<IOrderDocument>("Order", orderSchema);

export default OrderModel;
