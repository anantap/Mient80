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
  {
    id: "2027-01-planning-multimar-baasklus",
    collection: "planning",
    apply: (items) => {
      const plan = items as Collections["planning"];
      const seed = seedItems("planning", ["p6", "p8"]);
      // Alleen bijwerken wat nog op de oorspronkelijke planning staat.
      const p6 = plan.find((i) => i.id === "p6" && i.start === "2027-01-04" && i.notitie === "Begin januari, week 1–2");
      const p8 = plan.find((i) => i.id === "p8" && i.start === "2027-01-25" && i.eind === "2027-01-29");
      const update = seed.filter((i) => (i.id === "p6" && p6) || (i.id === "p8" && p8));
      return update.length ? update : null;
    },
  } as Migration,
  {
    id: "2026-10-radiator-muurstuk-opgemeten",
    collection: "todos",
    apply: (items) => {
      const todos = items as Collections["todos"];
      const seed = seedItems("todos", ["t6", "t7"]);
      // Alleen bijwerken wat nog in de oorspronkelijke vorm staat.
      const t6 = todos.find((t) => t.id === "t6" && t.notitie === "");
      const t7 = todos.find((t) => t.id === "t7" && !t.klaar && !t.notitie.includes("Opgemeten"));
      const update = seed
        .filter((t) => (t.id === "t6" && t6) || (t.id === "t7" && t7))
        .map((t) => (t.id === "t6" && t6 ? { ...t6, notitie: t.notitie } : t.id === "t7" && t7 ? { ...t7, klaar: true, afgevinkt: "2026-10-19", notitie: t.notitie } : t));
      return update.length ? update : null;
    },
  } as Migration,
  {
    id: "2026-10-radiator-volgende-stap",
    collection: "lijnen",
    apply: (items) => {
      const l7 = (items as Collections["lijnen"]).find(
        (l) => l.id === "l7" && l.volgendeStap === "Muurstuk opmeten en een hoge kolomradiator kiezen",
      );
      const seed = seedItems("lijnen", ["l7"])[0];
      return l7 ? [{ ...l7, volgendeStap: seed.volgendeStap, bijgewerkt: "2026-10-19" }] : null;
    },
  } as Migration,
];
