import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { type ErrorCode, ERROR_CATALOG } from "./errors";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
}

export function ok<T>(c: Context, data: T, message?: string) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return c.json(body, 200);
}

export function created<T>(c: Context, data: T, message?: string) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return c.json(body, 201);
}

export function fail(
  c: Context,
  code: ErrorCode,
  status?: number,
  message?: string,
  fields?: Record<string, string>
) {
  const meta = ERROR_CATALOG[code] ?? ERROR_CATALOG.SERVER_ERROR;
  const statusCode = (status ?? meta.status) as ContentfulStatusCode;
  const errorObj: ApiErrorResponse["error"] = {
    code,
    message: message ?? meta.message,
    ...(code === "VALIDATION_ERROR" && fields ? { fields } : {}),
  };

  return c.json(
    {
      success: false,
      error: errorObj,
    },
    statusCode
  );
}
