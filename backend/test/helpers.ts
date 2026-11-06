import { env } from "cloudflare:test";
import migrationSql from "../migrations/0001_initial.sql?raw";
import recoverySql from "../migrations/0002_password_recovery.sql?raw";
import registrationWindowsSql from "../migrations/0003_registration_windows.sql?raw";
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
  const columns = await env.DB.prepare("PRAGMA table_info(users)").all<{ name: string }>();
  if (!columns.results.some(column => column.name === "session_version")) {
    for (const stmt of cleanStatements(recoverySql)) await env.DB.prepare(stmt).run();
  }
  await env.DB.prepare("DELETE FROM password_reset_tokens").run();
  await env.DB.prepare("DELETE FROM password_reset_limits").run();
  const eventColumns = await env.DB.prepare("PRAGMA table_info(events)").all<{ name: string }>();
  if (!eventColumns.results.some(column => column.name === "registration_opens_at")) {
    for (const stmt of cleanStatements(registrationWindowsSql)) await env.DB.prepare(stmt).run();
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
