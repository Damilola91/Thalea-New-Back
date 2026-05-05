import { Router, Request, Response, NextFunction } from "express";
import express from "express";
import { handleStripeWebhook } from "./stripeWebhookHandler";
import logger from "../../shared/utils/logger/logger";

const router = Router();

// express.raw() qui — riceve il body come Buffer grezzo, obbligatorio per Stripe
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      res.status(200).json({ received: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook error";

      logger.error({ scope: "stripe", event: "webhook_error", message });

      // 400 dice a Stripe di non ritentare (firma invalida, payload malformato)
      res.status(400).json({ statusCode: 400, message });
    }
  },
);

export default router;
