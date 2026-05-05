import OrderModel from "./orderModel";
import {
  IOrderDocument,
  OrderCurrency,
  OrderPaymentMethod,
  OrderStatus,
} from "./orderTypes";

interface CreateOrderRepositoryDto {
  bookingId: string;
  amount: number;
  currency: OrderCurrency;
  paymentMethod: OrderPaymentMethod;
  status?: OrderStatus;
  transactionId?: string;
  stripePaymentIntentId?: string;
}

export const createOrder = async (
  orderData: CreateOrderRepositoryDto,
): Promise<IOrderDocument> => {
  const newOrder = new OrderModel(orderData);
  return await newOrder.save();
};

export const findOrderById = async (
  orderId: string,
): Promise<IOrderDocument | null> => {
  return await OrderModel.findById(orderId).populate("bookingId");
};

export const findRawOrderById = async (
  orderId: string,
): Promise<IOrderDocument | null> => {
  return await OrderModel.findById(orderId);
};

export const findOrderByStripePaymentIntentId = async (
  stripePaymentIntentId: string,
): Promise<IOrderDocument | null> => {
  return await OrderModel.findOne({ stripePaymentIntentId });
};

export const updateOrderStatusById = async (
  orderId: string,
  status: OrderStatus,
): Promise<IOrderDocument | null> => {
  return await OrderModel.findByIdAndUpdate(
    orderId,
    { $set: { status } },
    { new: true },
  );
};

export const updateOrderStatusIfPending = async (
  orderId: string,
): Promise<boolean> => {
  const result = await OrderModel.updateOne(
    { _id: orderId, status: "pending" },
    { $set: { status: "paid" } },
  );

  return result.modifiedCount === 1;
};

export const markOrderAsFailedIfPending = async (
  orderId: string,
): Promise<boolean> => {
  const result = await OrderModel.updateOne(
    { _id: orderId, status: "pending" },
    { $set: { status: "failed" } },
  );

  return result.modifiedCount === 1;
};
