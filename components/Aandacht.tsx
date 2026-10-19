import { AlarmClock, ArrowRight, Flag } from "lucide-react";
import Link from "next/link";
import { addDays, diffDays, fmtDate } from "@/lib/dates";
import { PARTIJEN, STATUS_ORDER, type Lijn, type PlanItem, type Status, type Todo } from "@/lib/types";
import { Pill } from "./ui";

/** Hoe ver vooruit deadlines en mijlpalen als aandachtspunt meetellen */
const VOORUIT_DAGEN = 35;

const SOM_LABEL: Record<Status, (n: number) => string> = {
  loopt: (n) => (n === 1 ? "loopt" : "lopen"),
  wacht: (n) => (n === 1 ? "wacht" : "wachten"),
  geblokkeerd: () => "geblokkeerd",
  klaar: () => "klaar",
};

type Punt = {
  key: string;
  tone: "geblokkeerd" | "verlopen" | "binnenkort" | "wacht";
  tag: string;
  titel: string;
  sub: string;
  kritiek?: boolean;
} & ({ lijn: Lijn } | { href: string });

function wanneer(today: string, date: string): string {
  const d = diffDays(today, date);
  if (d === 0) return "Vandaag";
  if (d === 1) return "Morgen";
  if (d > 1) return `Over ${d} dagen`;
  return d === -1 ? "1 dag te laat" : `${-d} dagen te laat`;
}

export function Aandacht({
  lijnen,
  todos,
  planning,
  today,
  onOpenLijn,
}: {
  lijnen: Lijn[];
  todos: Todo[];
  planning: PlanItem[];
  today: string;
  onOpenLijn: (l: Lijn) => void;
}) {
  const horizon = addDays(today, VOORUIT_DAGEN);
  const lijnNaam = (id: string | null) => lijnen.find((l) => l.id === id)?.onderwerp;
  const partijNaam = (p: PlanItem["partij"]) => PARTIJEN.find((x) => x.id === p)?.naam ?? "";
  const kritiekEerst = (a: Lijn, b: Lijn) => Number(b.kritiek) - Number(a.kritiek);

  const geblokkeerd: Punt[] = lijnen
    .filter((l) => l.status === "geblokkeerd")
    .sort(kritiekEerst)
    .map((l) => ({ key: l.id, tone: "geblokkeerd", tag: "Geblokkeerd", titel: l.onderwerp, sub: l.volgendeStap || l.wie, kritiek: l.kritiek, lijn: l }));

  const verlopen: Punt[] = todos
    .filter((t) => !t.klaar && t.deadline && t.deadline < today)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .map((t) => ({
      key: t.id,
      tone: "verlopen",
      tag: wanneer(today, t.deadline!),
      titel: t.titel,
      sub: [`deadline ${fmtDate(t.deadline!)}`, lijnNaam(t.lijnId)].filter(Boolean).join(" · "),
      href: "/todo",
    }));

  const binnenkort: Punt[] = [
    ...planning
      .filter((i) => i.type !== "periode" && !i.klaar && i.start >= today && i.start <= horizon)
      .map((i) => ({
        date: i.start,
        punt: {
          key: i.id,
          tone: "binnenkort",
          tag: wanneer(today, i.start),
          titel: i.titel,
          sub: `${fmtDate(i.start)} · ${partijNaam(i.partij)}`,
          kritiek: i.kritiek || i.type === "deadline",
          href: "/planning",
        } as Punt,
      })),
    ...todos
      .filter((t) => !t.klaar && t.deadline && t.deadline >= today && t.deadline <= horizon)
      .map((t) => ({
        date: t.deadline!,
        punt: {
          key: t.id,
          tone: "binnenkort",
          tag: wanneer(today, t.deadline!),
          titel: t.titel,
          sub: [`to-do, deadline ${fmtDate(t.deadline!)}`, lijnNaam(t.lijnId)].filter(Boolean).join(" · "),
          href: "/todo",
        } as Punt,
      })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((x) => x.punt);

  const wacht: Punt[] = lijnen
    .filter((l) => l.status === "wacht" && l.kritiek)
    .map((l) => ({ key: l.id, tone: "wacht", tag: "Wacht op ander", titel: l.onderwerp, sub: l.volgendeStap || l.wie, kritiek: true, lijn: l }));

  const punten = [...geblokkeerd, ...verlopen, ...binnenkort, ...wacht];

  return (
    <div className="aandacht">
      <p className="stand">
        {STATUS_ORDER.map((s) => {
          const n = lijnen.filter((l) => l.status === s).length;
          return (
            <span key={s} className={`stand-item pill-${s}${n === 0 ? " is-zero" : ""}`}>
              <span className={`dot dot-${s}`} aria-hidden />
              <strong>{n}</strong> {SOM_LABEL[s](n)}
            </span>
          );
        })}
      </p>

      {punten.length === 0 ? (
        <p className="empty">Niets dat nu aandacht vraagt.</p>
      ) : (
        <ul className="punten">
          {punten.map((p) => {
            const inhoud = (
              <>
                <span className="punt-tag">
                  <Pill tone={p.tone}>
                    {p.tone === "binnenkort" && <AlarmClock size={11} strokeWidth={2.5} />}
                    {p.tag}
                  </Pill>
                </span>
                <span className="punt-body">
                  <span className="punt-titel">
                    {p.titel}
                    {p.kritiek && <Flag size={12} className="punt-flag" aria-label="Kritiek pad" />}
                  </span>
                  {p.sub && <span className="punt-sub">{p.sub}</span>}
                </span>
                <ArrowRight size={16} className="punt-arrow" aria-hidden />
              </>
            );
            return (
              <li key={`${p.tone}-${p.key}`}>
                {"lijn" in p ? (
                  <button type="button" className="punt" onClick={() => onOpenLijn(p.lijn)}>
                    {inhoud}
                  </button>
                ) : (
                  <Link href={p.href} className="punt">
                    {inhoud}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
