import logger from "../../utils/logger/logger";

export const logEmailEvent = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  logger.info({ scope: "email", event, ...payload });
};

export const logEmailError = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  logger.error({ scope: "email", event, ...payload });
};
