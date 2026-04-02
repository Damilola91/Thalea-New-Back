import { OrderPaymentMethod } from "./orderTypes";

export interface CreatePaymentOrderDto {
  bookingId: string;
  paymentMethod: OrderPaymentMethod;
}
