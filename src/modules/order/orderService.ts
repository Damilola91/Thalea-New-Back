import { CreatePaymentOrderDto } from "./orderDto";
import { createPaymentOrder } from "./orderCreation";
import { mapOrderResponse } from "./orderMapper";
import { findOrderById } from "./orderRepository";
import { IOrderResponse } from "./orderTypes";

export const createPaymentOrderService = async (
  data: CreatePaymentOrderDto,
) => {
  return await createPaymentOrder(data);
};

export const getOrderByIdService = async (
  orderId: string,
): Promise<IOrderResponse | null> => {
  const order = await findOrderById(orderId);

  if (!order) {
    return null;
  }

  return mapOrderResponse(order);
};
