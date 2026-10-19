import { SEED } from "./seed";
import type { Collections } from "./types";

/**
 * Aanpassingen voor een database die al gevuld is. Elke migratie raakt alleen data
 * die nog in de oorspronkelijke seedvorm staat, zodat eigen wijzigingen blijven staan.
 */
export const MIGRATIONS: {
  id: string;
  collection: keyof Collections;
  apply: (items: Collections["kosten"]) => Collections["kosten"] | null;
}[] = [
  {
    id: "2026-10-hvdh-offerte-w202600798",
    collection: "kosten",
    apply: (items) => {
      const placeholder = items.find((k) => k.id === "k5" && k.bedrag === 0 && k.omschrijving === "Nog geen offerte");
      if (!placeholder) return null;
      const nieuw = SEED.kosten.filter((k) => k.id === "k5" || k.id === "k6");
      return [...items.filter((k) => k.id !== "k5" && k.id !== "k6"), ...nieuw];
    },
  },
];
