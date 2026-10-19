/**
 * Zet de beginwaarden in Upstash Redis, maar alleen voor collecties die nog leeg zijn,
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
  const { hasDatabase, isEmpty, read, seedCollection, upsert } = await import("../lib/store");
  const { SEED } = await import("../lib/seed");
  const { MIGRATIONS } = await import("../lib/migrations");

  if (!hasDatabase()) {
    console.error("KV_REST_API_URL en KV_REST_API_TOKEN ontbreken. Draai eerst `vercel env pull .env.local`.");
    process.exit(1);
  }
  const redis = createRedis()!;

  for (const name of Object.keys(SEED) as (keyof typeof SEED)[]) {
    if (!(await isEmpty(name))) {
      console.log(`• ${name}: al gevuld, overgeslagen`);
      continue;
    }
    await seedCollection(name, SEED[name]);
    console.log(`✓ ${name}: ${SEED[name].length} items gezet`);
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
