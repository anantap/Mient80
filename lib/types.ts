export type Status = "loopt" | "wacht" | "geblokkeerd" | "klaar";

export interface Lijn {
  id: string;
  onderwerp: string;
  wie: string;
  status: Status;
  kritiek: boolean;
  volgendeStap: string;
  notitie: string;
  /** ISO-datum (yyyy-mm-dd) van de laatste wijziging */
  bijgewerkt: string;
}

export interface Todo {
  id: string;
  titel: string;
  klaar: boolean;
  deadline: string | null;
  notitie: string;
  lijnId: string | null;
  afgevinkt: string | null;
}

export type KostStatus = "begroot" | "offerte" | "geaccepteerd" | "betaald";

export interface Kost {
  id: string;
  categorie: string;
  leverancier: string;
  omschrijving: string;
  /** Bedrag incl. btw in centen; 0 = nog onbekend */
  bedrag: number;
  status: KostStatus;
  /** Betaald bedrag in centen */
  betaald: number;
}

export type PlanType = "mijlpaal" | "deadline" | "periode";
export type Partij = "multimar" | "baboon" | "baasklus" | "hvdh" | "wij" | "overig";

export interface PlanItem {
  id: string;
  titel: string;
  type: PlanType;
  start: string;
  /** Alleen bij periodes */
  eind: string | null;
  partij: Partij;
  klaar: boolean;
  kritiek: boolean;
  /** Onzeker / uitwijk: gestippeld getoond */
  onzeker: boolean;
  notitie: string;
}

export interface Collections {
  lijnen: Lijn[];
  todos: Todo[];
  kosten: Kost[];
  planning: PlanItem[];
}

export type CollectionName = keyof Collections;

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export const STATUS_ORDER: Status[] = ["loopt", "wacht", "geblokkeerd", "klaar"];

export const STATUS_LABEL: Record<Status, string> = {
  loopt: "Loopt",
  wacht: "Wacht op ander",
  geblokkeerd: "Geblokkeerd",
  klaar: "Klaar",
};

export const KOST_STATUS_ORDER: KostStatus[] = ["begroot", "offerte", "geaccepteerd", "betaald"];

export const KOST_STATUS_LABEL: Record<KostStatus, string> = {
  begroot: "Begroot",
  offerte: "Offerte",
  geaccepteerd: "Geaccepteerd",
  betaald: "Betaald",
};

export const PLAN_TYPE_LABEL: Record<PlanType, string> = {
  mijlpaal: "Mijlpaal",
  deadline: "Deadline",
  periode: "Periode",
};

export const PARTIJEN: { id: Partij; naam: string }[] = [
  { id: "multimar", naam: "Multimar" },
  { id: "baboon", naam: "Baboon" },
  { id: "baasklus", naam: "Baas klus" },
  { id: "hvdh", naam: "Hans van der Helm" },
  { id: "wij", naam: "Wij" },
  { id: "overig", naam: "Overig" },
];

/** Hoofdsom van de lening in centen */
export const LENING = 4_200_000;
