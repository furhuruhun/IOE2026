// Regenerate src/components/ui/mdiIconBundle.generated.json — subset kecil dari
// @iconify-json/mdi (paket devDependency, ~3MB) berisi HANYA icon "mdi:xxx" yang benar-benar
// dipakai di src/. Dipakai oleh src/components/ui/iconRegistry.ts via addCollection() supaya
// <Icon icon="mdi:..."> resolve dari data lokal, tidak fetch ke api.iconify.design saat
// runtime (relevan untuk target LCP < 2.5s mobile / < 2.0s desktop,
// TECHNICAL_CONSTRAINTS_FE.md §Browser & Device Support).
//
// WAJIB dijalankan ulang (`npm run icons:bundle`) tiap kali menambah icon "mdi:xxx" BARU
// di kode — kalau lupa, icon itu tetap tampil (fallback fetch ke CDN Iconify seperti semula),
// cuma tidak ikut ter-bundle offline. Script ini exit dengan error kalau ada nama icon yang
// salah ketik / tidak ada di paket MDI, supaya ketahuan dari CI/dev, bukan silent 404 di browser.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(rootDir, "src");

const grepOutput = execSync(
  `grep -rhoE "mdi:[a-z0-9-]+" "${srcDir}" --include="*.tsx" --include="*.ts" || true`
).toString();

const iconNames = [...new Set(grepOutput.split("\n").filter(Boolean).map((full) => full.replace("mdi:", "")))].sort();

if (iconNames.length === 0) {
  console.error("Tidak ada icon mdi: ditemukan di src/ — cek pattern grep di script ini.");
  process.exit(1);
}

const mdiJsonPath = path.join(rootDir, "node_modules/@iconify-json/mdi/icons.json");
const fullSet = JSON.parse(readFileSync(mdiJsonPath, "utf-8"));

const missing = iconNames.filter((name) => !fullSet.icons[name]);
if (missing.length > 0) {
  console.error("Icon MDI berikut tidak ditemukan di @iconify-json/mdi (cek typo):", missing);
  process.exit(1);
}

const subset = {
  prefix: fullSet.prefix,
  width: fullSet.width,
  height: fullSet.height,
  icons: Object.fromEntries(iconNames.map((name) => [name, fullSet.icons[name]])),
};

const outDir = path.join(srcDir, "components/ui");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "mdiIconBundle.generated.json");
writeFileSync(outPath, JSON.stringify(subset, null, 2) + "\n");

console.log(`Generated ${path.relative(rootDir, outPath)} — ${iconNames.length} icon:`);
console.log(iconNames.map((n) => `  mdi:${n}`).join("\n"));
