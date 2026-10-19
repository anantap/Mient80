"use client";

import { Flag, Pencil, Plus, User } from "lucide-react";
import { useState } from "react";
import { deleteItem, saveLijn } from "@/app/actions";
import { addDays, fmtDate, mondayOf } from "@/lib/dates";
import { newId } from "@/lib/format";
import { STATUS_LABEL, STATUS_ORDER, type Lijn, type PlanItem, type Status, type Todo } from "@/lib/types";
import { useCollection, useEdit } from "./EditProvider";
import { Sheet } from "./Sheet";
import { StatusCircles } from "./StatusCircles";
import { DeleteButton, PageHeader, Pill, Segmented, Toggle, WeekNav } from "./ui";
import { GRID_WEEKS, WeekGrid } from "./WeekGrid";

type Filter = "open" | "kritiek" | "alles";

function nextStatus(s: Status): Status {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(s) + 1) % STATUS_ORDER.length];
}

export function StatusView({
  initial,
  planning,
  todos,
  today,
}: {
  initial: Lijn[];
  planning: PlanItem[];
  todos: Todo[];
  today: string;
}) {
  const [lijnen, mutate] = useCollection(initial);
  const { notify } = useEdit();
  const [filter, setFilter] = useState<Filter>("open");
  const [monday, setMonday] = useState(() => mondayOf(today));
  const [editing, setEditing] = useState<Lijn | null>(null);

  const visible = lijnen.filter((l) =>
    filter === "open" ? l.status !== "klaar" : filter === "kritiek" ? l.kritiek : true,
  );

  function cycle(l: Lijn) {
    const updated = { ...l, status: nextStatus(l.status), bijgewerkt: today };
    mutate(
      () => saveLijn({ ...updated }),
      (prev) => prev.map((x) => (x.id === l.id ? updated : x)),
    ).then((ok) => {
      if (ok && updated.status === "klaar" && filter === "open") {
        notify(`"${l.onderwerp}" staat op Klaar; je ziet hem onder Alles.`);
      }
    });
  }

  function shiftWeek(n: number) {
    setMonday((m) => (n === 0 ? mondayOf(today) : addDays(m, n * 7)));
  }

  return (
    <>
      <PageHeader title="Status">
        <WeekNav monday={monday} weeks={GRID_WEEKS} onShift={shiftWeek} />
        <button
          type="button"
          className="btn btn-outline"
          onClick={() =>
            setEditing({ id: "", onderwerp: "", wie: "", status: "loopt", kritiek: false, volgendeStap: "", notitie: "", bijgewerkt: today })
          }
        >
          <Plus size={16} /> Lijn toevoegen
        </button>
      </PageHeader>

      <section className="panel">
        <h2 className="panel-title display">Hoe staan we ervoor?</h2>
        <StatusCircles lijnen={lijnen} />
      </section>

      <section className="panel">
        <div className="panel-bar">
          <h2 className="panel-title display">Lijnen</h2>
          <Segmented<Filter>
            label="Filter"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "open", label: "Open" },
              { value: "kritiek", label: "Kritiek pad" },
              { value: "alles", label: "Alles" },
            ]}
          />
        </div>
        {visible.length === 0 ? (
          <p className="empty">Geen lijnen in deze selectie.</p>
        ) : (
          <div className="cards">
            {visible.map((l) => (
              <article key={l.id} className={`card${l.kritiek ? " card-critical" : ""}${l.status === "klaar" ? " card-done" : ""}`}>
                <div className="card-top">
                  <Pill tone={l.status} onClick={() => cycle(l)} title="Tik om de status te wisselen">
                    {STATUS_LABEL[l.status]}
                  </Pill>
                  {l.kritiek && (
                    <span className="flag-critical">
                      <Flag size={13} /> Kritiek pad
                    </span>
                  )}
                  <button type="button" className="icon-btn card-edit" onClick={() => setEditing(l)} aria-label={`${l.onderwerp} bewerken`}>
                    <Pencil size={16} />
                  </button>
                </div>
                <h3 className="card-title display">{l.onderwerp}</h3>
                {l.wie && (
                  <p className="card-who">
                    <User size={14} /> {l.wie}
                  </p>
                )}
                {l.volgendeStap && (
                  <div className="card-next">
                    <span className="label">Volgende stap</span>
                    <p>{l.volgendeStap}</p>
                  </div>
                )}
                {l.notitie && <p className="card-note">{l.notitie}</p>}
                <p className="card-updated">Bijgewerkt {fmtDate(l.bijgewerkt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title display">Wie is waarmee bezig?</h2>
        <WeekGrid monday={monday} today={today} planning={planning} todos={todos} />
      </section>

      <LijnSheet
        lijn={editing}
        onClose={() => setEditing(null)}
        onSave={async (l) => {
          const item = { ...l, id: l.id || newId(), bijgewerkt: today };
          if (await mutate(() => saveLijn({ ...item }))) setEditing(null);
        }}
        onDelete={async (id) => {
          if (await mutate(() => deleteItem("lijnen", id), (prev) => prev.filter((x) => x.id !== id))) setEditing(null);
        }}
      />
    </>
  );
}

function LijnSheet({
  lijn,
  onClose,
  onSave,
  onDelete,
}: {
  lijn: Lijn | null;
  onClose: () => void;
  onSave: (l: Lijn) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <Sheet open={!!lijn} title={lijn?.id ? "Lijn bewerken" : "Nieuwe lijn"} onClose={onClose}>
      {lijn && <LijnForm key={lijn.id || "new"} lijn={lijn} onSave={onSave} onDelete={onDelete} onClose={onClose} />}
    </Sheet>
  );
}

function LijnForm({
  lijn,
  onSave,
  onDelete,
  onClose,
}: {
  lijn: Lijn;
  onSave: (l: Lijn) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(lijn);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Lijn>(k: K, v: Lijn[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await onSave(draft);
        setBusy(false);
      }}
    >
      <label className="field">
        <span>Onderwerp</span>
        <input required value={draft.onderwerp} onChange={(e) => set("onderwerp", e.target.value)} autoFocus={!lijn.id} />
      </label>
      <label className="field">
        <span>Wie</span>
        <input value={draft.wie} onChange={(e) => set("wie", e.target.value)} />
      </label>
      <div className="field">
        <span>Status</span>
        <div className="status-choices">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              className={`choice${draft.status === s ? " active" : ""}`}
              aria-pressed={draft.status === s}
              onClick={() => set("status", s)}
            >
              <Pill tone={s}>{STATUS_LABEL[s]}</Pill>
            </button>
          ))}
        </div>
      </div>
      <Toggle checked={draft.kritiek} onChange={(v) => set("kritiek", v)}>
        Kritiek pad
      </Toggle>
      <label className="field">
        <span>Volgende stap</span>
        <textarea rows={3} value={draft.volgendeStap} onChange={(e) => set("volgendeStap", e.target.value)} />
      </label>
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
        {lijn.id && <DeleteButton onConfirm={() => onDelete(lijn.id)} />}
      </div>
    </form>
  );
}
