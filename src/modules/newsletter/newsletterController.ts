import { NextFunction, Request, Response } from "express";
import { SendNewsletterDto, SubscribeNewsletterDto } from "./newsletterDto";
import {
  sendNewsletterService,
  subscribeNewsletterService,
} from "./newsletterService";

export const subscribeNewsletterController = async (
  req: Request<{}, {}, SubscribeNewsletterDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const subscriber = await subscribeNewsletterService(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Subscription successful",
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

export const sendNewsletterController = async (
  req: Request<{}, {}, SendNewsletterDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await sendNewsletterService(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Newsletter sent",
      result,
    });
  } catch (error) {
    next(error);
  }
};
