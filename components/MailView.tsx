"use client";

import { ArrowDownLeft, ArrowUpRight, ExternalLink, Flag, Link2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { deleteItem, saveMail } from "@/app/actions";
import { fmtDate, MAANDEN, parseISO } from "@/lib/dates";
import { newId } from "@/lib/format";
import { PARTIJEN, type Lijn, type Mail, type Partij } from "@/lib/types";
import { useCollection } from "./EditProvider";
import { PARTIJ_ICON, PARTIJ_INITIALEN } from "./partij";
import { Sheet } from "./Sheet";
import { DeleteButton, PageHeader, Segmented, Toggle } from "./ui";

type Filter = "alles" | "belangrijk" | Partij;

const gmailUrl = (threadId: string) => `https://mail.google.com/mail/u/0/#all/${threadId}`;
const partijNaam = (p: Partij) => PARTIJEN.find((x) => x.id === p)?.naam ?? p;

function maandLabel(iso: string): string {
  const d = parseISO(iso);
  const m = MAANDEN[d.getUTCMonth()];
  return `${m[0].toUpperCase()}${m.slice(1)} ${d.getUTCFullYear()}`;
}

export function MailView({ initial, lijnen }: { initial: Mail[]; lijnen: Lijn[] }) {
  const [mails, mutate] = useCollection(initial);
  const [filter, setFilter] = useState<Filter>("alles");
  const [editing, setEditing] = useState<Mail | null>(null);

  const sorted = [...mails].sort((a, b) => b.datum.localeCompare(a.datum) || b.id.localeCompare(a.id));
  const partijen = PARTIJEN.filter((p) => mails.some((m) => m.partij === p.id));
  const zichtbaar = sorted.filter((m) =>
    filter === "alles" ? true : filter === "belangrijk" ? m.belangrijk : m.partij === filter,
  );
  const maanden = [...new Set(zichtbaar.map((m) => m.datum.slice(0, 7)))];
  const lijnNaam = (id: string | null) => lijnen.find((l) => l.id === id)?.onderwerp;

  const nieuw = (): Mail => ({
    id: "",
    datum: new Date().toISOString().slice(0, 10),
    van: "",
    partij: "overig",
    richting: "in",
    onderwerp: "",
    samenvatting: "",
    lijnId: null,
    belangrijk: false,
    threadId: null,
  });

  return (
    <>
      <PageHeader title="Mail">
        <button type="button" className="btn btn-outline" onClick={() => setEditing(nieuw())}>
          <Plus size={16} /> Mail toevoegen
        </button>
      </PageHeader>

      <section className="panel">
        <div className="panel-bar">
          <h2 className="panel-title display">
            Mailverkeer <span className="count">{zichtbaar.length}</span>
          </h2>
          <div className="mail-filters">
            <Segmented<Filter>
              label="Filter"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "alles", label: "Alles" },
                { value: "belangrijk", label: "Belangrijk" },
              ]}
            />
            <div className="party-filter" role="group" aria-label="Filter op partij">
              {partijen.map((p) => {
                const Icon = PARTIJ_ICON[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`party-chip party-${p.id}${filter === p.id ? " active" : ""}`}
                    aria-pressed={filter === p.id}
                    onClick={() => setFilter(filter === p.id ? "alles" : p.id)}
                  >
                    <Icon size={13} /> {p.naam}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {zichtbaar.length === 0 ? (
          <p className="empty">Geen mails in deze selectie.</p>
        ) : (
          maanden.map((maand) => (
            <div key={maand} className="mail-month">
              <h3 className="mail-month-title">{maandLabel(`${maand}-01`)}</h3>
              <ol className="mail-list">
                {zichtbaar
                  .filter((m) => m.datum.startsWith(maand))
                  .map((m) => {
                    const naam = lijnNaam(m.lijnId);
                    return (
                      <li key={m.id} className={`mail party-${m.partij}${m.belangrijk ? " is-important" : ""}`}>
                        <span className="mail-dot" aria-hidden />
                        <div className="mail-date">{fmtDate(m.datum, false)}</div>
                        <article className="mail-card">
                          <div className="mail-head">
                            <span className="mail-who">
                              <span className={`avatar avatar-sm party-${m.partij}`} aria-hidden>
                                {PARTIJ_INITIALEN[m.partij]}
                              </span>
                              {m.van || partijNaam(m.partij)}
                            </span>
                            <span className="mail-dir">
                              {m.richting === "in" ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                              {m.richting === "in" ? "ontvangen" : "verstuurd"}
                            </span>
                            {m.belangrijk && (
                              <span className="flag-critical">
                                <Flag size={12} /> Belangrijk
                              </span>
                            )}
                            <button type="button" className="icon-btn mail-edit" onClick={() => setEditing(m)} aria-label="Bewerken">
                              <Pencil size={15} />
                            </button>
                          </div>
                          <h4 className="mail-subject">{m.onderwerp}</h4>
                          {m.samenvatting && <p className="mail-summary">{m.samenvatting}</p>}
                          {(naam || m.threadId) && (
                            <div className="mail-foot">
                              {naam && (
                                <span className="chip">
                                  <Link2 size={12} /> {naam}
                                </span>
                              )}
                              {m.threadId && (
                                <a className="mail-link" href={gmailUrl(m.threadId)} target="_blank" rel="noreferrer">
                                  Open in Gmail <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          )}
                        </article>
                      </li>
                    );
                  })}
              </ol>
            </div>
          ))
        )}
      </section>

      <Sheet open={!!editing} title={editing?.id ? "Mail bewerken" : "Mail toevoegen"} onClose={() => setEditing(null)}>
        {editing && (
          <MailForm
            key={editing.id || "new"}
            mail={editing}
            lijnen={lijnen}
            onClose={() => setEditing(null)}
            onSave={async (m) => {
              const item = { ...m, id: m.id || newId() };
              if (await mutate(() => saveMail({ ...item }))) setEditing(null);
            }}
            onDelete={async (id) => {
              if (await mutate(() => deleteItem("mails", id), (prev) => prev.filter((x) => x.id !== id))) setEditing(null);
            }}
          />
        )}
      </Sheet>
    </>
  );
}

function MailForm({
  mail,
  lijnen,
  onSave,
  onDelete,
  onClose,
}: {
  mail: Mail;
  lijnen: Lijn[];
  onSave: (m: Mail) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(mail);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Mail>(k: K, v: Mail[K]) => setDraft((d) => ({ ...d, [k]: v }));

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
        <input required value={draft.onderwerp} onChange={(e) => set("onderwerp", e.target.value)} autoFocus={!mail.id} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Datum</span>
          <input type="date" required value={draft.datum} onChange={(e) => set("datum", e.target.value)} />
        </label>
        <div className="field">
          <span>Richting</span>
          <Segmented<Mail["richting"]>
            label="Richting"
            value={draft.richting}
            onChange={(v) => set("richting", v)}
            options={[
              { value: "in", label: "Ontvangen" },
              { value: "uit", label: "Verstuurd" },
            ]}
          />
        </div>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Van / aan</span>
          <input value={draft.van} onChange={(e) => set("van", e.target.value)} placeholder="Bijv. Lindy (Baboon)" />
        </label>
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
      </div>
      <label className="field">
        <span>Samenvatting</span>
        <textarea rows={5} value={draft.samenvatting} onChange={(e) => set("samenvatting", e.target.value)} />
      </label>
      <label className="field">
        <span>Statuslijn</span>
        <select value={draft.lijnId ?? ""} onChange={(e) => set("lijnId", e.target.value || null)}>
          <option value="">Geen</option>
          {lijnen.map((l) => (
            <option key={l.id} value={l.id}>
              {l.onderwerp}
            </option>
          ))}
        </select>
      </label>
      <Toggle checked={draft.belangrijk} onChange={(v) => set("belangrijk", v)}>
        Belangrijk
      </Toggle>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Opslaan
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Annuleren
        </button>
        {mail.id && <DeleteButton onConfirm={() => onDelete(mail.id)} />}
      </div>
    </form>
  );
}
