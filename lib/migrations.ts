import { SEED } from "./seed";
import type { CollectionName, Collections } from "./types";

type Migration<K extends CollectionName = CollectionName> = {
  id: string;
  collection: K;
  /** Geeft de items die opgeslagen moeten worden, of null als er niets te doen is. */
  apply: (items: Collections[K]) => Collections[K] | null;
};

const seedItems = <K extends CollectionName>(name: K, ids: string[]) =>
  (SEED[name] as Collections[K][number][]).filter((x) => ids.includes(x.id)) as Collections[K];

/**
 * Eenmalige aanvullingen voor een database die al gevuld is. De site past elke migratie
 * één keer toe (zie lib/store.ts) en raakt alleen data die nog in de oorspronkelijke vorm
 * staat, zodat eigen wijzigingen blijven staan.
 */
export const MIGRATIONS: Migration[] = [
  {
    id: "2026-10-hvdh-offerte-w202600798",
    collection: "kosten",
    apply: (items) => {
      const kosten = items as Collections["kosten"];
      const placeholder = kosten.find((k) => k.id === "k5" && k.bedrag === 0 && k.omschrijving === "Nog geen offerte");
      return placeholder ? seedItems("kosten", ["k5", "k6"]) : null;
    },
  } as Migration,
  {
    id: "2026-10-showroom-hvdh-30-okt",
    collection: "planning",
    apply: (items) => ((items as Collections["planning"]).some((i) => i.id === "p10") ? null : seedItems("planning", ["p10"])),
  } as Migration,
];
