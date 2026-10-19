/**
 * Zet de beginwaarden in Upstash Redis, maar alleen voor collecties die nog nooit gevuld zijn,
 * en voert daarna eenmalige migraties uit (lib/migrations.ts).
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
  const { createRedis, KEY_PREFIX } = await import("../lib/redis");
  const { hasDatabase, read, upsert } = await import("../lib/store");
  const { SEED } = await import("../lib/seed");
  const { MIGRATIONS } = await import("../lib/migrations");

  if (!hasDatabase()) {
    console.error("KV_REST_API_URL en KV_REST_API_TOKEN ontbreken. Draai eerst `vercel env pull .env.local`.");
    process.exit(1);
  }
  const redis = createRedis()!;

  // Lezen vult een collectie die nog nooit gevuld is met de beginwaarden (zie lib/store.ts).
  for (const name of Object.keys(SEED) as (keyof typeof SEED)[]) {
    console.log(`✓ ${name}: ${(await read(name)).length} items`);
  }

  for (const m of MIGRATIONS) {
    const doneKey = `${KEY_PREFIX}migratie:${m.id}`;
    if (await redis.get(doneKey)) continue;
    const items = m.apply(await read(m.collection));
    for (const item of items ?? []) await upsert(m.collection, item);
    console.log(items ? `✓ migratie ${m.id} toegepast` : `• migratie ${m.id}: niet nodig`);
    await redis.set(doneKey, new Date().toISOString());
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
