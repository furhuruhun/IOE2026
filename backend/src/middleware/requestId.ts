import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../env";

export const requestIdMiddleware: MiddlewareHandler<AppContext> = async (
  c,
  next
) => {
  const reqId = c.req.header("X-Request-Id") || crypto.randomUUID();
  c.set("requestId", reqId);
  c.header("X-Request-Id", reqId);
  await next();
};
