import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { fail } from "../lib/response";
import type { AppContext } from "../env";

export const errorHandler: ErrorHandler<AppContext> = (err, c) => {
  if (err instanceof AppError) {
    return fail(c, err.code, err.status, err.message, err.fields);
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "form";
      if (!fields[key]) {
        fields[key] = issue.message;
      }
    }
    return fail(c, "VALIDATION_ERROR", 400, undefined, fields);
  }

  console.error(`[Error] ${c.get("requestId") || ""}`, err);
  return fail(c, "SERVER_ERROR", 500);
};
