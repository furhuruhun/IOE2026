// server-only
import { cookies } from "next/headers";

const WORKERS_API_URL = process.env.WORKERS_API_URL;

export const COOKIE_NAME = "ioe_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // 7 hari — HARUS diselaraskan dengan expiry JWT di Workers, lihat AUTH_IMPLEMENTATION.md §Awareness A1
  maxAge: 60 * 60 * 24 * 7,
};

export const CLEAR_AUTH_COOKIE_OPTIONS = {
  ...AUTH_COOKIE_OPTIONS,
  maxAge: 0,
};

interface FetchWorkersOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

interface WorkersResult<T = unknown> {
  status: number;
  body: T;
}

export async function fetchWorkers<T = unknown>(
  path: string,
  options: FetchWorkersOptions = {}
): Promise<WorkersResult<T>> {
  if (!WORKERS_API_URL) {
    throw new Error("WORKERS_API_URL belum di-set — cek .env.local");
  }

  const { token, headers, body, ...rest } = options;

  const res = await fetch(`${WORKERS_API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as T;
  return { status: res.status, body: json };
}

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}
