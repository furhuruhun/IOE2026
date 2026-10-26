import { SignJWT, jwtVerify } from "jose";

export async function signJwt(
  user: { id: string; role: "peserta" | "panitia" },
  secret: string,
  ttlSeconds = 60 * 60 * 24 * 7
): Promise<string> {
  const enc = new TextEncoder();
  const secretKey = enc.encode(secret);

  return new SignJWT({
    role: user.role,
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
): Promise<{ sub: string; role: "peserta" | "panitia" } | null> {
  try {
    const enc = new TextEncoder();
    const secretKey = enc.encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.sub || typeof payload.sub !== "string") return null;
    const role = (payload.role as "peserta" | "panitia") || "peserta";
    return { sub: payload.sub, role };
  } catch {
    return null;
  }
}
