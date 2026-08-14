import type {
  User,
  RegisterRequestBody,
  LoginRequestBody,
  GoogleLoginRequestBody,
  ApiResponse,
  AuthResponseData,
  GoogleAuthResponseData,
} from "@/types/auth";

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.error?.code ?? "SERVER_ERROR", json.error?.message ?? "Terjadi kesalahan, coba lagi nanti");
  }
  return json.data;
}

export async function registerUser(body: RegisterRequestBody): Promise<AuthResponseData> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return unwrap<AuthResponseData>(res);
}

export async function loginUser(body: LoginRequestBody): Promise<AuthResponseData> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return unwrap<AuthResponseData>(res);
}

export async function loginWithGoogle(body: GoogleLoginRequestBody): Promise<GoogleAuthResponseData> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return unwrap<GoogleAuthResponseData>(res);
}

export async function logoutUser(): Promise<null> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  return unwrap<null>(res);
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me");
  return unwrap<User | null>(res);
}
