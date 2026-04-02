import { getLodgifyApiKey } from "../../../modules/lodgify/lodgifyConfig";

interface LodgifyRequestOptions {
  method: "GET" | "POST" | "PUT";
  body?: unknown;
}

export const lodgifyAdapterRequest = async (
  url: string,
  options: LodgifyRequestOptions,
): Promise<any> => {
  const response = await fetch(url, {
    method: options.method,
    headers: {
      "X-ApiKey": getLodgifyApiKey(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Lodgify error ${response.status}: ${errorText || response.statusText}`,
    );
  }

  return await response.json().catch(() => ({}));
};
