export const logEmailEvent = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  console.log(
    JSON.stringify({
      scope: "email",
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
};

export const logEmailError = (
  event: string,
  payload: Record<string, unknown>,
): void => {
  console.error(
    JSON.stringify({
      scope: "email",
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
};
