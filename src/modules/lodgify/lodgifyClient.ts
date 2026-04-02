import { getLodgifyApiKey } from "./lodgifyConfig";

interface LodgifyRequestOptions {
  method: "GET" | "POST" | "PUT";
  body?: unknown;
}

export const lodgifyRequest = async (
  url: string,
  options: LodgifyRequestOptions,
): Promise<Response> => {
  return await fetch(url, {
    method: options.method,
    headers: {
      "X-ApiKey": getLodgifyApiKey(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });
};
