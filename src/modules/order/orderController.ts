import { NextFunction, Request, Response } from "express";
import { CreatePaymentOrderDto } from "./orderDto";
import { createPaymentOrderService, getOrderByIdService } from "./orderService";

export const createPaymentOrderController = async (
  req: Request<{}, {}, CreatePaymentOrderDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await createPaymentOrderService(req.body);

    res.status(201).json({
      statusCode: 201,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController = async (
  req: Request<{ orderId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await getOrderByIdService(orderId);

    if (!order) {
      res.status(404).json({
        statusCode: 404,
        message: "Ordine non trovato",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      order,
    });
  } catch (error) {
    next(error);
  }
};
