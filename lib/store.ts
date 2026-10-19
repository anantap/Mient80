import type { Redis } from "@upstash/redis";
import { createRedis, KEY_PREFIX } from "./redis";
import { SEED } from "./seed";
import type { CollectionName, Collections } from "./types";

type Item<K extends CollectionName> = Collections[K][number];
/** Elk item staat als eigen veld in een Redis-hash, zodat wijzigingen elkaar niet overschrijven. */
type Entry<T> = { pos: number; item: T };

let client: Redis | null | undefined;
function db(): Redis | null {
  if (client === undefined) client = createRedis();
  return client;
}

/** Alleen voor tests: een andere Redis-client gebruiken. */
export function setRedisForTests(redis: Redis | null): void {
  client = redis;
}

export function hasDatabase(): boolean {
  return db() !== null;
}

const hashKey = (name: CollectionName) => `${KEY_PREFIX}v2:${name}`;
/** Oude opslag: één JSON-document per collectie */
const legacyKey = (name: CollectionName) => KEY_PREFIX + name;

// Zonder Redis-configuratie (lokaal ontwikkelen) draait de app op een geheugenkopie van de seed.
const g = globalThis as unknown as { __mient80Memory?: Collections };
function memory(): Collections {
  if (!g.__mient80Memory) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[mient80] Geen KV_REST_API_URL/KV_REST_API_TOKEN gevonden; data wordt niet bewaard.");
    }
    g.__mient80Memory = structuredClone(SEED);
  }
  return g.__mient80Memory;
}

function toEntries<T extends { id: string }>(items: T[]): Record<string, Entry<T>> {
  return Object.fromEntries(items.map((item, pos) => [item.id, { pos, item }]));
}

function sorted<K extends CollectionName>(entries: Record<string, Entry<Item<K>>>): Collections[K] {
  return Object.values(entries)
    .sort((a, b) => a.pos - b.pos || a.item.id.localeCompare(b.item.id))
    .map((e) => e.item) as Collections[K];
}

async function readEntries<K extends CollectionName>(redis: Redis, name: K): Promise<Record<string, Entry<Item<K>>>> {
  const hash = await redis.hgetall<Record<string, Entry<Item<K>>>>(hashKey(name));
  if (hash && Object.keys(hash).length > 0) return hash;

  // Eenmalig overzetten vanuit het oude JSON-document; dat blijft als back-up bewaard.
  const legacy = await redis.get<Item<K>[]>(legacyKey(name));
  if (!Array.isArray(legacy) || legacy.length === 0) return {};
  const entries = toEntries(legacy);
  await redis.hset(hashKey(name), entries);
  try {
    await redis.rename(legacyKey(name), `${legacyKey(name)}:v1-backup`);
  } catch {
    // Een gelijktijdig verzoek heeft het al overgezet.
  }
  return entries;
}

export async function read<K extends CollectionName>(name: K): Promise<Collections[K]> {
  const redis = db();
  if (!redis) return structuredClone(memory()[name]);
  return sorted<K>(await readEntries(redis, name));
}

/** Of een collectie nog helemaal leeg is (ook in de oude opslag). */
export async function isEmpty(name: CollectionName): Promise<boolean> {
  return (await read(name)).length === 0;
}

/** Hele collectie neerzetten; alleen bedoeld voor de seed. */
export async function seedCollection<K extends CollectionName>(name: K, items: Collections[K]): Promise<void> {
  const redis = db();
  if (!redis) {
    memory()[name] = structuredClone(items);
    return;
  }
  if (items.length > 0) await redis.hset(hashKey(name), toEntries(items as Item<K>[]));
}

export async function upsert<K extends CollectionName>(name: K, item: Item<K>): Promise<Collections[K]> {
  const redis = db();
  if (!redis) {
    const items = memory()[name] as Item<K>[];
    const i = items.findIndex((x) => x.id === item.id);
    if (i >= 0) items[i] = structuredClone(item);
    else items.push(structuredClone(item));
    return structuredClone(items) as Collections[K];
  }
  const entries = await readEntries(redis, name);
  const entry: Entry<Item<K>> = { pos: entries[item.id]?.pos ?? Date.now(), item };
  await redis.hset(hashKey(name), { [item.id]: entry });
  // Het resultaat bevat altijd de eigen wijziging, ook als de leeskopie net achterloopt.
  return sorted<K>({ ...entries, [item.id]: entry });
}

export async function remove<K extends CollectionName>(name: K, id: string): Promise<Collections[K]> {
  const redis = db();
  if (!redis) {
    const items = (memory()[name] as Item<K>[]).filter((x) => x.id !== id);
    memory()[name] = items as never;
    return structuredClone(items) as Collections[K];
  }
  const entries = await readEntries(redis, name);
  await redis.hdel(hashKey(name), id);
  delete entries[id];
  return sorted<K>(entries);
}
