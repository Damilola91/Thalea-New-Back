export const logStripeEvent = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  console.log(
    JSON.stringify({
      scope: "stripe",
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
};

export const logStripeError = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  console.error(
    JSON.stringify({
      scope: "stripe",
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
};
