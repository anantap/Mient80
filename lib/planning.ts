import { mondayOf } from "./dates";
import type { PlanItem } from "./types";

/** Standaardbereik: okt 2026 t/m apr 2027 (ISO-week 40/2026 t/m 17/2027) */
export const RANGE_START = "2026-09-28";
export const RANGE_END = "2027-05-02";

export const planEnd = (i: PlanItem) => i.eind ?? i.start;

/** Bereik van de tijdlijn: het standaardbereik, verruimd als er items buiten vallen. Start op een maandag. */
export function planRange(items: PlanItem[]): { start: string; end: string } {
  const first = items.reduce((m, i) => (i.start < m ? i.start : m), RANGE_START);
  const last = items.reduce((m, i) => (planEnd(i) > m ? planEnd(i) : m), RANGE_END);
  return { start: mondayOf(first), end: last };
}
