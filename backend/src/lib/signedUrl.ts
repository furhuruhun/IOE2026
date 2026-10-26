async function getHmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generateSignedFileUrl(
  origin: string,
  key: string,
  secret: string,
  ttlSeconds = 3600
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = await getHmac(secret, `${key}.${exp}`);
  return `${origin}/api/files/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`;
}

export async function verifyFileSignature(
  key: string,
  exp: number,
  sig: string,
  secret: string
): Promise<boolean> {
  if (Math.floor(Date.now() / 1000) > exp) return false;
  const expectedSig = await getHmac(secret, `${key}.${exp}`);
  return sig === expectedSig;
}
