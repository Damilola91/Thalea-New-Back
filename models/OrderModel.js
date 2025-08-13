const mongoose = require("mongoose");

const enumCurrency = ["EUR", "USD", "GBP", "JPY", "AUD", "CAD"];
const enumPaymentMethod = ["card", "paypal", "bank_transfer"];

const OrderSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    currency: {
      type: String,
      enum: enumCurrency,
      default: "EUR",
    },
    paymentMethod: {
      type: String,
      enum: enumPaymentMethod,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
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
  }
);

module.exports = mongoose.model("Order", OrderSchema);
