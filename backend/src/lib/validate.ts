import { z } from "zod";
import { AppError } from "./errors";

export function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fields[key]) {
        fields[key] = issue.message;
      }
    }
    throw new AppError("VALIDATION_ERROR", 400, undefined, fields);
  }
  return result.data;
}
