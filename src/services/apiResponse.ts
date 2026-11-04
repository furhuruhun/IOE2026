import { ERROR_MESSAGES } from "@/constants/errorMessages";

export class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function unwrapResponse<T>(res: Response): Promise<T> {
  const failure = () => new ApiError(res.status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR", ERROR_MESSAGES.SERVER_ERROR.message);
  let json;
  try { json = await res.json(); } catch { throw failure(); }
  if (!json || typeof json !== "object") throw failure();
  if (json.success === false) {
    if (typeof json.error?.code !== "string" || typeof json.error?.message !== "string") throw failure();
    throw new ApiError(json.error.code, json.error.message);
  }
  if (!res.ok || json.success !== true || !("data" in json)) throw failure();
  return json.data as T;
}
