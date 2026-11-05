import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/features/auth/PasswordForm.tsx', import.meta.url), 'utf8');
const expression = source.match(/export const passwordManagementEnabled = (.+);/)[1];
for (const [value, expected] of [[undefined, true], ['1', true], ['0', false]]) {
  const env = value === undefined ? {} : { NEXT_PUBLIC_PASSWORD_MANAGEMENT_ENABLED: value };
  assert.equal(runInNewContext(expression, { process: { env } }), expected);
}
console.log('Password flag checks passed');
