import { SEED } from "./seed";
import type { Kost } from "./types";

/**
 * Aanpassingen voor een database die al gevuld is. Elke migratie raakt alleen data
 * die nog in de oorspronkelijke seedvorm staat, zodat eigen wijzigingen blijven staan.
 * `apply` geeft de items terug die opgeslagen moeten worden, of null als er niets te doen is.
 */
export const MIGRATIONS: { id: string; collection: "kosten"; apply: (items: Kost[]) => Kost[] | null }[] = [
  {
    id: "2026-10-hvdh-offerte-w202600798",
    collection: "kosten",
    apply: (items) => {
      const placeholder = items.find((k) => k.id === "k5" && k.bedrag === 0 && k.omschrijving === "Nog geen offerte");
      if (!placeholder) return null;
      return SEED.kosten.filter((k) => k.id === "k5" || k.id === "k6");
    },
  },
];
