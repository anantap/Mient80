import Link from "next/link";
import { diffDays, fmtDate, MAANDEN_KORT, parseISO } from "@/lib/dates";
import { planRange } from "@/lib/planning";
import type { PlanItem } from "@/lib/types";

/** Geschatte breedte van een label, als deel van de lijn (voor het verdelen over banen). */
const LABEL_W = 0.12;
const LANES = ["boven-1", "onder-1", "boven-2", "onder-2"] as const;

type Moment = { item: PlanItem; date: string; x: number; lane?: (typeof LANES)[number]; flip?: boolean };

function dotClass(i: PlanItem): string {
  if (i.klaar) return "is-done";
  if (i.onzeker) return "is-dashed";
  if (i.kritiek || i.type === "deadline") return "is-critical";
  return "";
}

/** Eenvoudige tijdlijn met de belangrijke momenten: mijlpalen, deadlines en de start van periodes. */
export function Momenten({ planning, today }: { planning: PlanItem[]; today: string }) {
  const { start, end } = planRange(planning);
  const total = diffDays(start, end) + 1;
  const pos = (d: string) => Math.min(1, Math.max(0, (diffDays(start, d) + 0.5) / total));

  const momenten: Moment[] = planning
    .map((item) => ({ item, date: item.start, x: pos(item.start) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Labels verdelen over banen boven en onder de lijn zodat ze niet overlappen; afgeronde momenten krijgen
  // alleen een bolletje.
  const laneEnd: Record<string, number> = {};
  for (const m of momenten) {
    if (m.item.klaar) continue;
    m.flip = m.x > 1 - LABEL_W;
    const left = m.flip ? m.x - LABEL_W : m.x;
    m.lane = LANES.find((l) => (laneEnd[l] ?? -1) < left) ?? LANES[momenten.indexOf(m) % 2];
    laneEnd[m.lane] = left + LABEL_W;
  }

  const maanden: { x: number; label: string }[] = [];
  for (let d = parseISO(start); ; ) {
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    const iso = d.toISOString().slice(0, 10);
    if (iso > end) break;
    maanden.push({ x: pos(iso), label: MAANDEN_KORT[d.getUTCMonth()] });
  }
  const todayIn = today >= start && today <= end;

  return (
    <Link href="/planning" className="momenten" aria-label="Naar de planning">
      <div className="mt-line" aria-hidden>
        <div className="mt-track" />
        {todayIn && <div className="mt-progress" style={{ width: `${pos(today) * 100}%` }} />}
        {maanden.map((m) => (
          <span key={m.label + m.x} className="mt-month" style={{ left: `${m.x * 100}%` }}>
            {m.label}
          </span>
        ))}
        {todayIn && (
          <span className="mt-today" style={{ left: `${pos(today) * 100}%` }}>
            <span>vandaag</span>
          </span>
        )}
        {momenten.map((m) => (
          <span
            key={m.item.id}
            className={`mt-dot ${dotClass(m.item)}`}
            style={{ left: `${m.x * 100}%` }}
            title={`${m.item.titel} · ${fmtDate(m.date)}`}
          />
        ))}
        {momenten
          .filter((m) => m.lane)
          .map((m) => (
            <span
              key={`l-${m.item.id}`}
              className={`mt-label mt-${m.lane}${m.flip ? " is-flip" : ""}`}
              style={{ left: `${m.x * 100}%` }}
            >
              <span className="mt-date">{fmtDate(m.date, false)}</span>
              <span className="mt-title">{m.item.titel}</span>
            </span>
          ))}
      </div>

      {/* Mobiel: verticale lijn */}
      <ol className="mt-vertical">
        {momenten.flatMap((m, idx) => {
          const prev = momenten[idx - 1]?.date;
          const rows = [];
          if (todayIn && today <= m.date && (!prev || today > prev)) rows.push(<TodayRow key="today" today={today} />);
          rows.push(
            <li key={m.item.id} className={m.item.klaar ? "is-past" : undefined}>
              <span className={`mt-dot ${dotClass(m.item)}`} aria-hidden />
              <span className="mtv-date">{fmtDate(m.date, false)}</span>
              <span className="mtv-title">{m.item.titel}</span>
            </li>,
          );
          if (todayIn && idx === momenten.length - 1 && today > m.date) rows.push(<TodayRow key="today" today={today} />);
          return rows;
        })}
      </ol>
    </Link>
  );
}


function TodayRow({ today }: { today: string }) {
  return (
    <li className="mtv-today">
      <span className="mt-today-dot" aria-hidden />
      <span className="mtv-date">{fmtDate(today, false)}</span>
      <span className="mtv-title">vandaag</span>
    </li>
  );
}
