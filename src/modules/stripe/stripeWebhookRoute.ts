import { Router, Request, Response } from "express";
import express from "express";
import { handleStripeWebhook } from "./stripeWebhookHandler";
import logger from "../../shared/utils/logger/logger";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      res.status(400).json({
        statusCode: 400,
        message: "Stripe signature mancante",
      });
      return;
    }

    try {
      await handleStripeWebhook(req.body as Buffer, signature);
      res.sendStatus(200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook error";

      logger.error({
        scope: "stripe",
        event: "webhook_error",
        message,
      });

      res.status(400).json({
        statusCode: 400,
        message,
      });
    }
  },
);

export default router;
