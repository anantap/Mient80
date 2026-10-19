export const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
export const MAANDEN_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
export const DAGEN_KORT = ["ma", "di", "wo", "do", "vr", "za", "zo"];

const DAY = 86_400_000;

/** yyyy-mm-dd → Date (UTC middernacht) */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  return toISO(new Date(parseISO(iso).getTime() + n * DAY));
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / DAY);
}

/** Vandaag in Nederland, als yyyy-mm-dd */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

/** Maandag van de week waarin iso valt */
export function mondayOf(iso: string): string {
  const day = (parseISO(iso).getUTCDay() + 6) % 7;
  return addDays(iso, -day);
}

export function isoWeek(iso: string): { year: number; week: number } {
  const d = parseISO(iso);
  const day = (d.getUTCDay() + 6) % 7;
  const thursday = new Date(d.getTime() + (3 - day) * DAY);
  const year = thursday.getUTCFullYear();
  const jan1 = Date.UTC(year, 0, 1);
  const week = 1 + Math.floor((thursday.getTime() - jan1) / (7 * DAY));
  return { year, week };
}

export function fmtDate(iso: string, withYear = true): string {
  const d = parseISO(iso);
  const s = `${d.getUTCDate()} ${MAANDEN_KORT[d.getUTCMonth()]}`;
  return withYear ? `${s} ${d.getUTCFullYear()}` : s;
}

export function fmtDay(iso: string): string {
  const d = parseISO(iso);
  return `${d.getUTCDate()} ${MAANDEN_KORT[d.getUTCMonth()]}`;
}

/** "19 – 25 oktober" of "26 oktober – 1 november" */
export function fmtWeekRange(monday: string, days = 7): string {
  const a = parseISO(monday);
  const b = parseISO(addDays(monday, days - 1));
  if (a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()} – ${b.getUTCDate()} ${MAANDEN[a.getUTCMonth()]}`;
  }
  return `${a.getUTCDate()} ${MAANDEN_KORT[a.getUTCMonth()]} – ${b.getUTCDate()} ${MAANDEN_KORT[b.getUTCMonth()]}`;
}

export function isValidISO(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  return toISO(parseISO(v)) === v;
}
