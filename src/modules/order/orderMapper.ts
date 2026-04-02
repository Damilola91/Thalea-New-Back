import { IOrderDocument, IOrderResponse } from "./orderTypes";

export const mapOrderResponse = (order: IOrderDocument): IOrderResponse => {
  return {
    id: order._id.toString(),
    bookingId: order.bookingId,
    amount: order.amount.toString(),
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    status: order.status,
    transactionId: order.transactionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};
