"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { deleteItem, saveKost } from "@/app/actions";
import { euroInput, fmtEuro, newId, parseEuro } from "@/lib/format";
import { KOST_STATUS_LABEL, KOST_STATUS_ORDER, LENING, type Kost, type KostStatus } from "@/lib/types";
import { useCollection } from "./EditProvider";
import { Sheet } from "./Sheet";
import { DeleteButton, PageHeader, Pill } from "./ui";

function Bedrag({ cents }: { cents: number }) {
  return cents ? <span className="num">{fmtEuro(cents)}</span> : <span className="unknown">nog onbekend</span>;
}

export function KostenView({ initial }: { initial: Kost[] }) {
  const [kosten, mutate] = useCollection(initial);
  const [editing, setEditing] = useState<Kost | null>(null);

  const categorieen = [...new Set(kosten.map((k) => k.categorie))];
  const totaal = kosten.reduce((s, k) => s + k.bedrag, 0);
  const betaald = kosten.reduce((s, k) => s + k.betaald, 0);
  const resterend = LENING - totaal;
  const onbekend = kosten.filter((k) => !k.bedrag).length;

  const nieuw = (categorie = ""): Kost => ({
    id: "",
    categorie,
    leverancier: "",
    omschrijving: "",
    bedrag: 0,
    status: "begroot",
    betaald: 0,
  });

  return (
    <div className="with-totals">
      <PageHeader title="Kosten">
        <button type="button" className="btn btn-outline" onClick={() => setEditing(nieuw())}>
          <Plus size={16} /> Post toevoegen
        </button>
      </PageHeader>

      {categorieen.length === 0 && (
        <section className="panel">
          <p className="empty">Nog geen kostenposten.</p>
        </section>
      )}

      {categorieen.map((cat) => {
        const posten = kosten.filter((k) => k.categorie === cat);
        const sub = posten.reduce((s, k) => s + k.bedrag, 0);
        const subBetaald = posten.reduce((s, k) => s + k.betaald, 0);
        return (
          <section key={cat} className="panel">
            <div className="panel-bar">
              <h2 className="panel-title display">{cat}</h2>
              <div className="cat-total">
                <span className="num">{sub ? fmtEuro(sub) : "nog onbekend"}</span>
                {subBetaald > 0 && <span className="muted num">{fmtEuro(subBetaald)} betaald</span>}
              </div>
            </div>
            <ul className="posts">
              {posten.map((k) => (
                <li key={k.id}>
                  <button type="button" className="post" onClick={() => setEditing(k)}>
                    <span className="post-main">
                      <span className="post-supplier">{k.leverancier || "—"}</span>
                      {k.omschrijving && <span className="post-desc">{k.omschrijving}</span>}
                    </span>
                    <span className="post-status">
                      <Pill tone={k.status}>{KOST_STATUS_LABEL[k.status]}</Pill>
                    </span>
                    <span className="post-amount">
                      <Bedrag cents={k.bedrag} />
                      {k.betaald > 0 && k.betaald !== k.bedrag && (
                        <span className="post-paid num">{fmtEuro(k.betaald)} betaald</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-text" onClick={() => setEditing(nieuw(cat))}>
              <Plus size={15} /> Post in {cat}
            </button>
          </section>
        );
      })}

      <div className="totals-bar" role="region" aria-label="Totalen">
        <div className="totals-inner">
          <div>
            <span className="label">Totaal begroot</span>
            <strong className="num">{fmtEuro(totaal)}</strong>
            {onbekend > 0 && <span className="totals-note">+ {onbekend} nog onbekend</span>}
          </div>
          <div>
            <span className="label">Totaal betaald</span>
            <strong className="num">{fmtEuro(betaald)}</strong>
          </div>
          <div>
            <span className="label">Resterend van lening</span>
            <strong className={`num${resterend < 0 ? " negative" : ""}`}>{fmtEuro(resterend)}</strong>
            <span className="totals-note num">van {fmtEuro(LENING)}</span>
          </div>
        </div>
      </div>

      <Sheet open={!!editing} title={editing?.id ? "Post bewerken" : "Nieuwe post"} onClose={() => setEditing(null)}>
        {editing && (
          <KostForm
            key={editing.id || "new"}
            kost={editing}
            categorieen={categorieen}
            onClose={() => setEditing(null)}
            onSave={async (k) => {
              const item = { ...k, id: k.id || newId() };
              if (await mutate(() => saveKost({ ...item }))) setEditing(null);
            }}
            onDelete={async (id) => {
              if (await mutate(() => deleteItem("kosten", id), (prev) => prev.filter((x) => x.id !== id))) setEditing(null);
            }}
          />
        )}
      </Sheet>
    </div>
  );
}

function KostForm({
  kost,
  categorieen,
  onSave,
  onDelete,
  onClose,
}: {
  kost: Kost;
  categorieen: string[];
  onSave: (k: Kost) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(kost);
  const [bedrag, setBedrag] = useState(euroInput(kost.bedrag));
  const [betaald, setBetaald] = useState(euroInput(kost.betaald));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Kost>(k: K, v: Kost[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function setStatus(s: KostStatus) {
    set("status", s);
    if (s === "betaald" && !betaald.trim()) setBetaald(bedrag);
  }

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const b = parseEuro(bedrag);
        const p = parseEuro(betaald);
        if (b === null || p === null) {
          setError("Vul bedragen in als 1.234,56");
          return;
        }
        setError("");
        setBusy(true);
        await onSave({ ...draft, bedrag: b, betaald: p });
        setBusy(false);
      }}
    >
      <label className="field">
        <span>Categorie</span>
        <input required list="categorieen" value={draft.categorie} onChange={(e) => set("categorie", e.target.value)} />
        <datalist id="categorieen">
          {categorieen.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label className="field">
        <span>Leverancier</span>
        <input value={draft.leverancier} onChange={(e) => set("leverancier", e.target.value)} autoFocus={!kost.id} />
      </label>
      <label className="field">
        <span>Omschrijving</span>
        <textarea rows={2} value={draft.omschrijving} onChange={(e) => set("omschrijving", e.target.value)} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Bedrag incl. btw</span>
          <div className="euro-input">
            <span aria-hidden>€</span>
            <input inputMode="decimal" placeholder="nog onbekend" value={bedrag} onChange={(e) => setBedrag(e.target.value)} />
          </div>
        </label>
        <label className="field">
          <span>Betaald</span>
          <div className="euro-input">
            <span aria-hidden>€</span>
            <input inputMode="decimal" placeholder="0,00" value={betaald} onChange={(e) => setBetaald(e.target.value)} />
          </div>
        </label>
      </div>
      <div className="field">
        <span>Status</span>
        <div className="status-choices">
          {KOST_STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              className={`choice${draft.status === s ? " active" : ""}`}
              aria-pressed={draft.status === s}
              onClick={() => setStatus(s)}
            >
              <Pill tone={s}>{KOST_STATUS_LABEL[s]}</Pill>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Opslaan
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Annuleren
        </button>
        {kost.id && <DeleteButton onConfirm={() => onDelete(kost.id)} />}
      </div>
    </form>
  );
}
