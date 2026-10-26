// scripts/create-admin.mjs
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = resolve(__dirname, "..");

const email = process.argv[2] || "admin@ioe2027.itb.ac.id";
const name = process.argv[3] || "Panitia IOE 2027";
const password = process.argv[4] || "AdminIOE2027!";

// Simple PBKDF2 hash using WebCrypto in Node
async function hashPassword(pw) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pw),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const saltB64 = Buffer.from(salt).toString("base64");
  const hashB64 = Buffer.from(derivedBits).toString("base64");
  return `pbkdf2$sha256$100000$${saltB64}$${hashB64}`;
}

async function main() {
  const hash = await hashPassword(password);
  const now = new Date().toISOString();
  const id = `usr_adm_${Date.now()}`;

  const sql = `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES ('${id}', '${email}', '${name}', '${hash}', 'panitia', '${now}', '${now}') ON CONFLICT(email) DO UPDATE SET role = 'panitia', password_hash = '${hash}';`;

  console.log(`Creating / updating admin user: ${email} (${password})...`);
  try {
    execSync(
      `npx wrangler d1 execute ioe2027 --local --command="${sql.replace(/"/g, '\\"')}"`,
      { stdio: "inherit", cwd: backendDir }
    );
    console.log("Admin user ready!");
  } catch (err) {
    console.error("Failed to execute D1 command:", err);
  }
}

main();
