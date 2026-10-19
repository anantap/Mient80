import { Check } from "lucide-react";
import { addDays, DAGEN_KORT, fmtDay } from "@/lib/dates";
import { PARTIJEN, type PlanItem, type Todo } from "@/lib/types";
import { PARTIJ_ICON, PARTIJ_INITIALEN, planIcon, TodoIcon } from "./partij";

function covers(item: PlanItem, day: string): boolean {
  return item.start <= day && (item.eind ?? item.start) >= day;
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
  const days = Array.from({ length: 5 }, (_, i) => addDays(monday, i));
  const rows = PARTIJEN.filter(
    (p) => p.id !== "overig" || planning.some((i) => i.partij === "overig" && days.some((d) => covers(i, d))),
  );

  return (
    <div className="weekgrid-scroll">
      <table className="weekgrid">
        <thead>
          <tr>
            <th className="wg-corner" />
            {days.map((d, i) => (
              <th key={d} className={d === today ? "wg-today" : undefined}>
                <span className="wg-day">{DAGEN_KORT[i]}</span>
                <span className="wg-date">{fmtDay(d)}</span>
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
                {days.map((d) => {
                  const items = planning.filter((i) => i.partij === p.id && covers(i, d));
                  const due = p.id === "wij" ? todos.filter((t) => !t.klaar && t.deadline === d) : [];
                  const empty = items.length === 0 && due.length === 0;
                  return (
                    <td key={d} className={d === today ? "wg-col-today" : undefined}>
                      {empty ? (
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
                                <span>{i.titel}</span>
                              </div>
                            );
                          })}
                          {due.map((t) => (
                            <div key={t.id} className="wg-card party-wij">
                              <TodoIcon size={14} />
                              <span>{t.titel}</span>
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
