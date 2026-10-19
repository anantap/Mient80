/**
 * Zet de beginwaarden in Upstash Redis, maar alleen voor collecties die nog nooit gevuld zijn,
 * en past eenmalige migraties toe (lib/migrations.ts). De site doet dit ook zelf.
 * Leest KV_REST_API_URL / KV_REST_API_TOKEN uit de omgeving of uit .env.local / .env.
 */
import { existsSync, readFileSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

async function main() {
  // Pas na het laden van de env importeren: de store maakt de Redis-client lui aan.
  const { hasDatabase, read } = await import("../lib/store");
  const { SEED } = await import("../lib/seed");

  if (!hasDatabase()) {
    console.error("KV_REST_API_URL en KV_REST_API_TOKEN ontbreken. Draai eerst `vercel env pull .env.local`.");
    process.exit(1);
  }
  // Lezen vult een collectie die nog nooit gevuld is en past migraties toe (zie lib/store.ts).
  for (const name of Object.keys(SEED) as (keyof typeof SEED)[]) {
    console.log(`✓ ${name}: ${(await read(name)).length} items`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
