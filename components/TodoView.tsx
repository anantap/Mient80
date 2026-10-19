"use client";

import { AlarmClock, Check, ChevronDown, Link2, Plus } from "lucide-react";
import { useState } from "react";
import { deleteItem, saveTodo } from "@/app/actions";
import { fmtDate } from "@/lib/dates";
import { newId } from "@/lib/format";
import type { Lijn, Todo } from "@/lib/types";
import { useCollection } from "./EditProvider";
import { Sheet } from "./Sheet";
import { DeleteButton, PageHeader } from "./ui";

const EMPTY: Todo = { id: "", titel: "", klaar: false, deadline: null, notitie: "", lijnId: null, afgevinkt: null };

function byDeadline(a: Todo, b: Todo): number {
  if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
  return a.deadline ? -1 : b.deadline ? 1 : 0;
}

export function TodoView({ initial, lijnen, today }: { initial: Todo[]; lijnen: Lijn[]; today: string }) {
  const [todos, mutate] = useCollection(initial);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [quick, setQuick] = useState("");

  const open = todos.filter((t) => !t.klaar).sort(byDeadline);
  const done = todos
    .filter((t) => t.klaar)
    .sort((a, b) => (b.afgevinkt ?? "").localeCompare(a.afgevinkt ?? ""));
  const lijnNaam = (id: string | null) => lijnen.find((l) => l.id === id)?.onderwerp;

  function toggle(t: Todo) {
    const updated: Todo = { ...t, klaar: !t.klaar, afgevinkt: t.klaar ? null : today };
    mutate(
      () => saveTodo({ ...updated }),
      (prev) => prev.map((x) => (x.id === t.id ? updated : x)),
    );
  }

  async function addQuick(e: React.FormEvent) {
    e.preventDefault();
    const titel = quick.trim();
    if (!titel) return;
    const item: Todo = { ...EMPTY, id: newId(), titel };
    if (await mutate(() => saveTodo({ ...item }), (prev) => [...prev, item])) setQuick("");
  }

  const row = (t: Todo) => {
    const overdue = !t.klaar && t.deadline && t.deadline < today;
    const naam = lijnNaam(t.lijnId);
    return (
      <li key={t.id} className={`todo${t.klaar ? " is-done" : ""}`}>
        <button
          type="button"
          className="check"
          role="checkbox"
          aria-checked={t.klaar}
          aria-label={t.klaar ? "Markeer als open" : "Afvinken"}
          onClick={() => toggle(t)}
        >
          {t.klaar && <Check size={14} strokeWidth={3} />}
        </button>
        <button type="button" className="todo-body" onClick={() => setEditing(t)}>
          <span className="todo-title">{t.titel}</span>
          {(t.deadline || naam) && (
            <span className="todo-meta">
              {t.deadline && (
                <span className={`chip${overdue ? " chip-danger" : ""}`}>
                  <AlarmClock size={13} /> {fmtDate(t.deadline)}
                  {overdue && " · verlopen"}
                </span>
              )}
              {naam && (
                <span className="chip">
                  <Link2 size={13} /> {naam}
                </span>
              )}
            </span>
          )}
          {t.notitie && <span className="todo-note">{t.notitie}</span>}
        </button>
      </li>
    );
  };

  return (
    <>
      <PageHeader title="To-do">
        <button type="button" className="btn btn-outline" onClick={() => setEditing({ ...EMPTY })}>
          <Plus size={16} /> To-do toevoegen
        </button>
      </PageHeader>

      <section className="panel">
        <form className="quick-add" onSubmit={addQuick}>
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="Nieuwe to-do…"
            aria-label="Nieuwe to-do"
          />
          <button type="submit" className="btn btn-primary" disabled={!quick.trim()}>
            <Plus size={16} /> Toevoegen
          </button>
        </form>

        <h2 className="panel-title serif">
          Te doen <span className="count">{open.length}</span>
        </h2>
        {open.length === 0 ? <p className="empty">Alles is afgevinkt.</p> : <ul className="todos">{open.map(row)}</ul>}

        {done.length > 0 && (
          <details className="done-group">
            <summary>
              <ChevronDown size={16} className="chev" /> Afgevinkt <span className="count">{done.length}</span>
            </summary>
            <ul className="todos">{done.map(row)}</ul>
          </details>
        )}
      </section>

      <Sheet open={!!editing} title={editing?.id ? "To-do bewerken" : "Nieuwe to-do"} onClose={() => setEditing(null)}>
        {editing && (
          <TodoForm
            key={editing.id || "new"}
            todo={editing}
            lijnen={lijnen}
            onClose={() => setEditing(null)}
            onSave={async (t) => {
              const item = { ...t, id: t.id || newId() };
              if (await mutate(() => saveTodo({ ...item }))) setEditing(null);
            }}
            onDelete={async (id) => {
              if (await mutate(() => deleteItem("todos", id), (prev) => prev.filter((x) => x.id !== id))) setEditing(null);
            }}
          />
        )}
      </Sheet>
    </>
  );
}

function TodoForm({
  todo,
  lijnen,
  onSave,
  onDelete,
  onClose,
}: {
  todo: Todo;
  lijnen: Lijn[];
  onSave: (t: Todo) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(todo);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Todo>(k: K, v: Todo[K]) => setDraft((d) => ({ ...d, [k]: v }));

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
        <span>Titel</span>
        <input required value={draft.titel} onChange={(e) => set("titel", e.target.value)} autoFocus={!todo.id} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Deadline (optioneel)</span>
          <input type="date" value={draft.deadline ?? ""} onChange={(e) => set("deadline", e.target.value || null)} />
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
      </div>
      <label className="field">
        <span>Notitie</span>
        <textarea rows={4} value={draft.notitie} onChange={(e) => set("notitie", e.target.value)} />
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={draft.klaar}
          onChange={(e) => setDraft((d) => ({ ...d, klaar: e.target.checked, afgevinkt: e.target.checked ? d.afgevinkt : null }))}
        />
        <span className="toggle-track" aria-hidden />
        <span>Afgevinkt</span>
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Opslaan
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Annuleren
        </button>
        {todo.id && <DeleteButton onConfirm={() => onDelete(todo.id)} />}
      </div>
    </form>
  );
}
