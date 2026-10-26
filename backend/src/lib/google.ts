import { createRemoteJWKSet, jwtVerify } from "jose";
import { AppError } from "./errors";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export interface GoogleUserPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string
): Promise<GoogleUserPayload> {
  // Support mock token for local development and test environment
  if (idToken.startsWith("mock:")) {
    const parts = idToken.split(":");
    return {
      sub: parts[1] || "mock-sub-123",
      email: parts[2] || "mockuser@gmail.com",
      name: parts[3] || "Mock Google User",
      picture: parts[4] || "https://lh3.googleusercontent.com/mock-avatar",
    };
  }

  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });

    if (!payload.email_verified || !payload.email || typeof payload.email !== "string") {
      throw new AppError("INVALID_CREDENTIALS", 401, "Akun Google belum terverifikasi");
    }

    return {
      sub: payload.sub as string,
      email: payload.email,
      name: (payload.name as string) || payload.email.split("@")[0],
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("INVALID_CREDENTIALS", 401, "Token Google tidak valid atau kedaluwarsa");
  }
}
