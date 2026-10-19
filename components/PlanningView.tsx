"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { deleteItem, savePlanItem } from "@/app/actions";
import { addDays, diffDays, fmtDate, fmtWeekRange, isoWeek, MAANDEN_KORT, mondayOf, parseISO } from "@/lib/dates";
import { newId } from "@/lib/format";
import { planRange } from "@/lib/planning";
import { PARTIJEN, PLAN_TYPE_LABEL, type Partij, type PlanItem, type PlanType } from "@/lib/types";
import { useCollection } from "./EditProvider";
import { planIcon } from "./partij";
import { Sheet } from "./Sheet";
import { DeleteButton, PageHeader, Segmented, Toggle } from "./ui";

const WEEK_W = 52;
const DAY_W = WEEK_W / 7;

const end = (i: PlanItem) => i.eind ?? i.start;
const partijNaam = (p: Partij) => PARTIJEN.find((x) => x.id === p)?.naam ?? p;

function itemClass(i: PlanItem): string {
  return [
    `tl-${i.type}`,
    `party-${i.partij}`,
    i.klaar && "is-done",
    i.kritiek && "is-critical",
    i.onzeker && "is-dashed",
  ]
    .filter(Boolean)
    .join(" ");
}

function itemDates(i: PlanItem): string {
  return i.type === "periode" && i.eind && i.eind !== i.start
    ? `${fmtDate(i.start, false)} – ${fmtDate(i.eind)}`
    : fmtDate(i.start);
}

export function PlanningView({ initial, today }: { initial: PlanItem[]; today: string }) {
  const [items, mutate] = useCollection(initial);
  const [editing, setEditing] = useState<PlanItem | null>(null);

  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start) || end(a).localeCompare(end(b)));
  const { start, end: last } = planRange(sorted);
  const weekCount = Math.ceil((diffDays(start, last) + 1) / 7);
  const weeks = Array.from({ length: weekCount }, (_, n) => addDays(start, n * 7));

  const nieuw = (): PlanItem => ({
    id: "",
    titel: "",
    type: "mijlpaal",
    start: today,
    eind: null,
    partij: "wij",
    klaar: false,
    kritiek: false,
    onzeker: false,
    notitie: "",
  });

  return (
    <>
      <PageHeader title="Planning">
        <button type="button" className="btn btn-outline" onClick={() => setEditing(nieuw())}>
          <Plus size={16} /> Item toevoegen
        </button>
      </PageHeader>

      <section className="panel">
        <div className="panel-bar">
          <h2 className="panel-title display">Tijdlijn</h2>
          <ul className="legend">
            <li><span className="lg lg-period" /> Periode</li>
            <li><span className="lg lg-critical" /> Kritiek pad</li>
            <li><span className="lg lg-dashed" /> Onzeker</li>
            <li><span className="lg lg-milestone" /> Mijlpaal</li>
            <li><span className="lg lg-today" /> Vandaag</li>
          </ul>
        </div>
        <Gantt items={sorted} weeks={weeks} start={start} today={today} onEdit={setEditing} />
        <VerticalTimeline items={sorted} weeks={weeks} today={today} onEdit={setEditing} />
      </section>

      <Sheet open={!!editing} title={editing?.id ? "Item bewerken" : "Nieuw item"} onClose={() => setEditing(null)}>
        {editing && (
          <PlanForm
            key={editing.id || "new"}
            item={editing}
            onClose={() => setEditing(null)}
            onSave={async (i) => {
              const item = { ...i, id: i.id || newId() };
              if (await mutate(() => savePlanItem({ ...item }))) setEditing(null);
            }}
            onDelete={async (id) => {
              if (await mutate(() => deleteItem("planning", id), (prev) => prev.filter((x) => x.id !== id))) setEditing(null);
            }}
          />
        )}
      </Sheet>
    </>
  );
}

function Gantt({
  items,
  weeks,
  start,
  today,
  onEdit,
}: {
  items: PlanItem[];
  weeks: string[];
  start: string;
  today: string;
  onEdit: (i: PlanItem) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const todayX = (diffDays(start, today) + 0.5) * DAY_W;
  const inRange = todayX >= 0 && todayX <= weeks.length * WEEK_W;
  const thisMonday = mondayOf(today);

  useEffect(() => {
    if (scroller.current && inRange) scroller.current.scrollLeft = Math.max(0, todayX - 3 * WEEK_W);
  }, [inRange, todayX]);

  return (
    <div className="gantt-scroll" ref={scroller}>
      <div className="gantt" style={{ "--weeks": weeks.length, "--week-w": `${WEEK_W}px` } as React.CSSProperties}>
        <div className="gantt-head">
          <div className="gantt-label gantt-corner" />
          <div className="gantt-track gantt-weeks">
            {weeks.map((w) => {
              const d = parseISO(w);
              const sunday = parseISO(addDays(w, 6));
              const crosses = d.getUTCDate() === 1 || sunday.getUTCMonth() !== d.getUTCMonth();
              const monthLabel = w === weeks[0] && !crosses ? MAANDEN_KORT[d.getUTCMonth()] : crosses ? MAANDEN_KORT[sunday.getUTCMonth()] : "";
              return (
                <div key={w} className={`gantt-week${w === thisMonday ? " is-now" : ""}`}>
                  <span className="gantt-month">{monthLabel}</span>
                  <span className="gantt-wk">{isoWeek(w).week}</span>
                  <span className="gantt-date">{d.getUTCDate()}/{d.getUTCMonth() + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
        {items.map((i) => {
          const Icon = i.klaar ? Check : planIcon(i);
          const left = diffDays(start, i.start) * DAY_W;
          const width = (diffDays(i.start, end(i)) + 1) * DAY_W;
          return (
            <div key={i.id} className="gantt-row">
              <button type="button" className="gantt-label" onClick={() => onEdit(i)}>
                <Icon size={15} />
                <span>
                  <span className="gantt-title">{i.titel}</span>
                  <span className="gantt-sub">
                    {itemDates(i)} · {partijNaam(i.partij)}
                  </span>
                </span>
              </button>
              <div className="gantt-track">
                {i.type === "periode" ? (
                  <button
                    type="button"
                    className={`tl-bar ${itemClass(i)}`}
                    style={{ left, width }}
                    onClick={() => onEdit(i)}
                    aria-label={`${i.titel}, ${itemDates(i)}`}
                  >
                    {width >= 64 && <span>{i.titel}</span>}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`tl-diamond ${itemClass(i)}`}
                    style={{ left: left + DAY_W / 2 }}
                    onClick={() => onEdit(i)}
                    aria-label={`${i.titel}, ${itemDates(i)}`}
                  />
                )}
              </div>
            </div>
          );
        })}
        {inRange && (
          <div className="gantt-today" style={{ left: `calc(var(--label-w) + var(--pad) + ${todayX}px)` }}>
            <span>vandaag</span>
          </div>
        )}
      </div>
    </div>
  );
}

function VerticalTimeline({
  items,
  weeks,
  today,
  onEdit,
}: {
  items: PlanItem[];
  weeks: string[];
  today: string;
  onEdit: (i: PlanItem) => void;
}) {
  const thisMonday = mondayOf(today);
  return (
    <ol className="vtl">
      {weeks.map((w) => {
        const sunday = addDays(w, 6);
        const active = items.filter((i) => i.start <= sunday && end(i) >= w);
        const isNow = w === thisMonday;
        return (
          <li key={w} className={`vtl-week${isNow ? " is-now" : ""}${active.length === 0 ? " is-empty" : ""}`}>
            <div className="vtl-when">
              <strong>Wk {isoWeek(w).week}</strong>
              <span>{fmtWeekRange(w)}</span>
              {isNow && <span className="now-tag">vandaag</span>}
            </div>
            <div className="vtl-items">
              {active.map((i) => {
                const Icon = i.klaar ? Check : planIcon(i);
                const continues = i.start < w;
                return (
                  <button
                    key={i.id}
                    type="button"
                    className={`vtl-item ${itemClass(i)}${continues ? " is-continued" : ""}`}
                    onClick={() => onEdit(i)}
                  >
                    <Icon size={15} />
                    <span>
                      <span className="vtl-title">{i.titel}</span>
                      <span className="vtl-sub">
                        {continues ? `loopt t/m ${fmtDate(end(i), false)}` : itemDates(i)} · {partijNaam(i.partij)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PlanForm({
  item,
  onSave,
  onDelete,
  onClose,
}: {
  item: PlanItem;
  onSave: (i: PlanItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof PlanItem>(k: K, v: PlanItem[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await onSave({ ...draft, eind: draft.type === "periode" ? draft.eind ?? draft.start : null });
        setBusy(false);
      }}
    >
      <label className="field">
        <span>Titel</span>
        <input required value={draft.titel} onChange={(e) => set("titel", e.target.value)} autoFocus={!item.id} />
      </label>
      <div className="field">
        <span>Soort</span>
        <Segmented<PlanType>
          label="Soort"
          value={draft.type}
          onChange={(v) => set("type", v)}
          options={(["mijlpaal", "deadline", "periode"] as PlanType[]).map((t) => ({ value: t, label: PLAN_TYPE_LABEL[t] }))}
        />
      </div>
      <div className="field-row">
        <label className="field">
          <span>{draft.type === "periode" ? "Van" : "Datum"}</span>
          <input type="date" required value={draft.start} onChange={(e) => set("start", e.target.value)} />
        </label>
        {draft.type === "periode" && (
          <label className="field">
            <span>Tot en met</span>
            <input
              type="date"
              required
              min={draft.start}
              value={draft.eind ?? draft.start}
              onChange={(e) => set("eind", e.target.value)}
            />
          </label>
        )}
      </div>
      {draft.start && (
        <p className="muted small">
          Week {isoWeek(draft.start).week}
          {draft.type === "periode" && draft.eind && draft.eind !== draft.start ? ` t/m week ${isoWeek(draft.eind).week}` : ""}
        </p>
      )}
      <label className="field">
        <span>Partij</span>
        <select value={draft.partij} onChange={(e) => set("partij", e.target.value as Partij)}>
          {PARTIJEN.map((p) => (
            <option key={p.id} value={p.id}>
              {p.naam}
            </option>
          ))}
        </select>
      </label>
      <div className="toggles">
        <Toggle checked={draft.kritiek} onChange={(v) => set("kritiek", v)}>
          Kritiek pad
        </Toggle>
        <Toggle checked={draft.onzeker} onChange={(v) => set("onzeker", v)}>
          Onzeker (gestippeld)
        </Toggle>
        <Toggle checked={draft.klaar} onChange={(v) => set("klaar", v)}>
          Klaar
        </Toggle>
      </div>
      <label className="field">
        <span>Notitie</span>
        <textarea rows={3} value={draft.notitie} onChange={(e) => set("notitie", e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Opslaan
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Annuleren
        </button>
        {item.id && <DeleteButton onConfirm={() => onDelete(item.id)} />}
      </div>
    </form>
  );
}
