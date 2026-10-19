import { isValidISO } from "./dates";
import {
  KOST_STATUS_ORDER,
  PARTIJEN,
  STATUS_ORDER,
  type Kost,
  type Lijn,
  type Partij,
  type PlanItem,
  type PlanType,
  type Todo,
} from "./types";

type Raw = Record<string, unknown>;

function str(v: unknown, max = 2000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function id(v: unknown): string {
  const s = str(v, 40);
  if (!/^[\w-]+$/.test(s)) throw new Error("Ongeldig id");
  return s;
}
function oneOf<T extends string>(v: unknown, options: readonly T[], fallback: T): T {
  return options.includes(v as T) ? (v as T) : fallback;
}
function date(v: unknown): string | null {
  return isValidISO(v) ? v : null;
}
function cents(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), 100_000_000_00) : 0;
}
function required(s: string, label: string): string {
  if (!s) throw new Error(`${label} is verplicht`);
  return s;
}

export function cleanLijn(r: Raw, today: string): Lijn {
  return {
    id: id(r.id),
    onderwerp: required(str(r.onderwerp, 200), "Onderwerp"),
    wie: str(r.wie, 200),
    status: oneOf(r.status, STATUS_ORDER, "loopt"),
    kritiek: r.kritiek === true,
    volgendeStap: str(r.volgendeStap),
    notitie: str(r.notitie),
    bijgewerkt: today,
  };
}

export function cleanTodo(r: Raw, today: string): Todo {
  const klaar = r.klaar === true;
  return {
    id: id(r.id),
    titel: required(str(r.titel, 300), "Titel"),
    klaar,
    deadline: date(r.deadline),
    notitie: str(r.notitie),
    lijnId: r.lijnId ? id(r.lijnId) : null,
    afgevinkt: klaar ? date(r.afgevinkt) ?? today : null,
  };
}

export function cleanKost(r: Raw): Kost {
  return {
    id: id(r.id),
    categorie: required(str(r.categorie, 120), "Categorie"),
    leverancier: str(r.leverancier, 200),
    omschrijving: str(r.omschrijving, 1000),
    bedrag: cents(r.bedrag),
    status: oneOf(r.status, KOST_STATUS_ORDER, "begroot"),
    betaald: cents(r.betaald),
  };
}

const PLAN_TYPES: readonly PlanType[] = ["mijlpaal", "deadline", "periode"];
const PARTIJ_IDS: readonly Partij[] = PARTIJEN.map((p) => p.id);

export function cleanPlanItem(r: Raw): PlanItem {
  const type = oneOf(r.type, PLAN_TYPES, "mijlpaal");
  const start = date(r.start);
  if (!start) throw new Error("Startdatum is verplicht");
  let eind = type === "periode" ? date(r.eind) : null;
  if (type === "periode" && (!eind || eind < start)) eind = start;
  return {
    id: id(r.id),
    titel: required(str(r.titel, 200), "Titel"),
    type,
    start,
    eind,
    partij: oneOf(r.partij, PARTIJ_IDS, "overig"),
    klaar: r.klaar === true,
    kritiek: r.kritiek === true,
    onzeker: r.onzeker === true,
    notitie: str(r.notitie),
  };
}
