import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { stripe } from "../../config/stripe";
import logger from "../../shared/utils/logger/logger";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const checks: Record<string, "ok" | "error"> = {
    database: "ok",
    stripe: "ok",
  };

  // DB — readyState 1 = connected
  if (mongoose.connection.readyState !== 1) {
    checks.database = "error";
  }

  // Stripe — chiamata leggera senza costi
  try {
    await stripe.balance.retrieve();
  } catch {
    checks.stripe = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");
  const statusCode = allOk ? 200 : 503;

  if (!allOk) {
    logger.warn({ scope: "health", event: "health_check_failed", checks });
  }

  res.status(statusCode).json({
    status: allOk ? "ok" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
