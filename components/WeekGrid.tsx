import { Check } from "lucide-react";
import { addDays, fmtDate, fmtWeekRange, isoWeek, mondayOf } from "@/lib/dates";
import { PARTIJEN, type PlanItem, type Todo } from "@/lib/types";
import { PARTIJ_ICON, PARTIJ_INITIALEN, planIcon, TodoIcon } from "./partij";

export const GRID_WEEKS = 6;

const end = (i: PlanItem) => i.eind ?? i.start;

function inWeek(item: PlanItem, monday: string): boolean {
  return item.start <= addDays(monday, 6) && end(item) >= monday;
}

/** Korte datumhint per kaartje: datum van een mijlpaal, of tot wanneer een periode loopt. */
function hint(item: PlanItem, monday: string): string {
  if (item.type !== "periode") return fmtDate(item.start, false);
  const sunday = addDays(monday, 6);
  if (item.start >= monday && end(item) <= sunday) return `${fmtDate(item.start, false)} – ${fmtDate(end(item), false)}`;
  if (item.start >= monday) return `vanaf ${fmtDate(item.start, false)}`;
  return `t/m ${fmtDate(end(item), false)}`;
}

export function WeekGrid({
  monday,
  today,
  planning,
  todos,
}: {
  monday: string;
  today: string;
  planning: PlanItem[];
  todos: Todo[];
}) {
  const weeks = Array.from({ length: GRID_WEEKS }, (_, i) => addDays(monday, i * 7));
  const thisMonday = mondayOf(today);
  const rows = PARTIJEN.filter(
    (p) => p.id !== "overig" || planning.some((i) => i.partij === "overig" && weeks.some((w) => inWeek(i, w))),
  );

  return (
    <div className="weekgrid-scroll">
      <table className="weekgrid">
        <thead>
          <tr>
            <th className="wg-corner" />
            {weeks.map((w) => (
              <th key={w} className={w === thisMonday ? "wg-today" : undefined}>
                <span className="wg-day">Wk {isoWeek(w).week}</span>
                <span className="wg-date">{fmtWeekRange(w)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const Icon = PARTIJ_ICON[p.id];
            return (
              <tr key={p.id}>
                <th scope="row" className="wg-who">
                  <span className={`avatar party-${p.id}`} aria-hidden>
                    {p.id === "wij" ? <Icon size={16} /> : PARTIJ_INITIALEN[p.id]}
                  </span>
                  {p.naam}
                </th>
                {weeks.map((w) => {
                  const sunday = addDays(w, 6);
                  const items = planning.filter((i) => i.partij === p.id && inWeek(i, w));
                  const due =
                    p.id === "wij"
                      ? todos.filter((t) => !t.klaar && t.deadline && t.deadline >= w && t.deadline <= sunday)
                      : [];
                  return (
                    <td key={w} className={w === thisMonday ? "wg-col-today" : undefined}>
                      {items.length === 0 && due.length === 0 ? (
                        <div className="wg-empty" aria-label="Niets gepland" />
                      ) : (
                        <div className="wg-stack">
                          {items.map((i) => {
                            const ItemIcon = i.klaar ? Check : planIcon(i);
                            return (
                              <div
                                key={i.id}
                                className={`wg-card party-${p.id}${i.klaar ? " is-done" : ""}${i.onzeker ? " is-dashed" : ""}${i.kritiek ? " is-critical" : ""}`}
                              >
                                <ItemIcon size={14} />
                                <span>
                                  {i.titel}
                                  <span className="wg-hint">{hint(i, w)}</span>
                                </span>
                              </div>
                            );
                          })}
                          {due.map((t) => (
                            <div key={t.id} className="wg-card party-wij">
                              <TodoIcon size={14} />
                              <span>
                                {t.titel}
                                <span className="wg-hint">deadline {fmtDate(t.deadline!, false)}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
