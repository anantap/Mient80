import { createRedis, KEY_PREFIX } from "./redis";
import { SEED } from "./seed";
import type { CollectionName, Collections } from "./types";

const redis = createRedis();

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

export async function read<K extends CollectionName>(name: K): Promise<Collections[K]> {
  if (!redis) return structuredClone(memory()[name]);
  const value = await redis.get<Collections[K]>(KEY_PREFIX + name);
  return Array.isArray(value) ? value : ([] as unknown as Collections[K]);
}

export async function write<K extends CollectionName>(name: K, items: Collections[K]): Promise<void> {
  if (!redis) {
    memory()[name] = structuredClone(items);
    return;
  }
  await redis.set(KEY_PREFIX + name, items);
}

type Item<K extends CollectionName> = Collections[K][number];

export async function upsert<K extends CollectionName>(name: K, item: Item<K>): Promise<Collections[K]> {
  const items = (await read(name)) as Item<K>[];
  const i = items.findIndex((x) => x.id === item.id);
  if (i >= 0) items[i] = item;
  else items.push(item);
  await write(name, items as Collections[K]);
  return items as Collections[K];
}

export async function remove<K extends CollectionName>(name: K, id: string): Promise<Collections[K]> {
  const items = ((await read(name)) as Item<K>[]).filter((x) => x.id !== id);
  await write(name, items as Collections[K]);
  return items as Collections[K];
}
