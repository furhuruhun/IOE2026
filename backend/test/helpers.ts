import { env } from "cloudflare:test";
import migrationSql from "../migrations/0001_initial.sql?raw";
import seedSql from "../seed/seed.sql?raw";

function cleanStatements(rawSql: string): string[] {
  return rawSql
    .replace(/--.*$/gm, "") // remove comments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function resetDatabase() {
  const migrationStatements = cleanStatements(migrationSql);
  for (const stmt of migrationStatements) {
    await env.DB.prepare(stmt).run();
  }

  try {
    await env.DB.prepare("DELETE FROM users").run();
  } catch {}

  const seedStatements = cleanStatements(seedSql);
  for (const stmt of seedStatements) {
    await env.DB.prepare(stmt).run();
  }
}

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
