import logger from "../../utils/logger/logger";

export const logStripeEvent = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  logger.info({ scope: "stripe", event, ...payload });
};

export const logStripeError = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  logger.error({ scope: "stripe", event, ...payload });
};
