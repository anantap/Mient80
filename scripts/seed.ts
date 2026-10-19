/**
 * Zet de beginwaarden in Upstash Redis, maar alleen voor collecties die nog leeg zijn.
 * Leest KV_REST_API_URL / KV_REST_API_TOKEN uit de omgeving of uit .env.local / .env.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRedis, KEY_PREFIX } from "../lib/redis";
import { SEED } from "../lib/seed";
import type { CollectionName } from "../lib/types";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

async function main() {
  const redis = createRedis();
  if (!redis) {
    console.error("KV_REST_API_URL en KV_REST_API_TOKEN ontbreken. Draai eerst `vercel env pull .env.local`.");
    process.exit(1);
  }
  for (const name of Object.keys(SEED) as CollectionName[]) {
    const key = KEY_PREFIX + name;
    const current = await redis.get<unknown[]>(key);
    if (Array.isArray(current) && current.length > 0) {
      console.log(`• ${name}: al gevuld (${current.length} items), overgeslagen`);
      continue;
    }
    await redis.set(key, SEED[name]);
    console.log(`✓ ${name}: ${SEED[name].length} items gezet`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
