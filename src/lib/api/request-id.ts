import axios, { type AxiosResponse } from "axios";

// Response objects belong to individual attempts; request configs are reused on retry.
const requestIds = new WeakMap<AxiosResponse, string | undefined>();

function readRequestId(response: AxiosResponse): string | undefined {
  const entry = Object.entries(response.headers).find(
    ([name]) => name.toLowerCase() === "x-request-id",
  );
  const value: unknown = entry?.[1];

  // Only display a bounded, single opaque identifier, never arbitrary header text.
  return typeof value === "string" && /^[A-Za-z0-9._:-]{1,200}$/.test(value)
    ? value
    : undefined;
}

export function captureRequestId<T extends AxiosResponse>(response: T): T {
  requestIds.set(response, readRequestId(response));
  return response;
}

/** Extract only the ID of this response (or this Axios error's response). */
export function getRequestId(value: unknown): string | undefined {
  const response: unknown = axios.isAxiosError(value) ? value.response : value;
  if (!response || typeof response !== "object" || !("headers" in response)
    || !("status" in response) || typeof response.status !== "number"
    || !response.headers || typeof response.headers !== "object") return undefined;

  const axiosResponse = response as AxiosResponse;
  return requestIds.has(axiosResponse)
    ? requestIds.get(axiosResponse)
    : readRequestId(axiosResponse);
}
