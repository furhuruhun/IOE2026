import { SignJWT, jwtVerify } from "jose";

export async function signJwt(
  user: { id: string; role: "peserta" | "panitia"; session_version?: number },
  secret: string,
  ttlSeconds = 60 * 60 * 24 * 7
): Promise<string> {
  const enc = new TextEncoder();
  const secretKey = enc.encode(secret);

  return new SignJWT({
    role: user.role,
    sessionVersion: user.session_version ?? 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(secretKey);
}

export async function verifyJwt(
  token: string,
  secret: string
): Promise<{ sub: string; role: "peserta" | "panitia"; sessionVersion: number } | null> {
  try {
    const enc = new TextEncoder();
    const secretKey = enc.encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.sub || typeof payload.sub !== "string") return null;
    const role = (payload.role as "peserta" | "panitia") || "peserta";
    const sessionVersion = payload.sessionVersion ?? 0;
    if (typeof sessionVersion !== "number" || !Number.isSafeInteger(sessionVersion) || sessionVersion < 0) return null;
    return { sub: payload.sub, role, sessionVersion };
  } catch {
    return null;
  }
}
