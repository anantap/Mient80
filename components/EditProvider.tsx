"use client";

import { KeyRound } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { unlock } from "@/app/actions";
import type { ActionResult } from "@/lib/types";
import { Sheet } from "./Sheet";

interface EditContext {
  required: boolean;
  locked: boolean;
  /** Vraagt zo nodig om de code. Resolvet true als bewerken mag. */
  ensure: () => Promise<boolean>;
  markLocked: () => void;
  notify: (message: string) => void;
}

const Ctx = createContext<EditContext | null>(null);

export function useEdit(): EditContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEdit buiten EditProvider");
  return ctx;
}

export function EditProvider({
  required,
  initiallyLocked,
  children,
}: {
  required: boolean;
  initiallyLocked: boolean;
  children: React.ReactNode;
}) {
  const [locked, setLocked] = useState(initiallyLocked);
  const [asking, setAsking] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pending = useRef<((ok: boolean) => void)[]>([]);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  const settle = useCallback((ok: boolean) => {
    pending.current.splice(0).forEach((resolve) => resolve(ok));
    setAsking(false);
    setCode("");
    setError("");
  }, []);

  const ensure = useCallback(() => {
    if (!lockedRef.current) return Promise.resolve(true);
    setAsking(true);
    return new Promise<boolean>((resolve) => pending.current.push(resolve));
  }, []);

  const notify = useCallback((message: string) => setToast(message), []);
  const markLocked = useCallback(() => setLocked(true), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await unlock(code);
    setBusy(false);
    if (!ok) {
      setError("Die code klopt niet.");
      return;
    }
    setLocked(false);
    lockedRef.current = false;
    settle(true);
  }

  return (
    <Ctx.Provider value={{ required, locked, ensure, markLocked, notify }}>
      {children}
      <Sheet open={asking} title="Bewerkcode" onClose={() => settle(false)}>
        <form onSubmit={submit} className="form">
          <p className="muted">Voer de code in om wijzigingen te maken. Je hoeft dit op dit apparaat maar één keer te doen.</p>
          <label className="field">
            <span>Code</span>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy || !code}>
              <KeyRound size={16} /> Ontgrendelen
            </button>
            <button type="button" className="btn" onClick={() => settle(false)}>
              Annuleren
            </button>
          </div>
        </form>
      </Sheet>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Lokale kopie van een collectie met optimistische updates via server actions. */
export function useCollection<T>(initial: T[]) {
  const [items, setItems] = useState(initial);
  const { ensure, markLocked, notify } = useEdit();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const mutate = useCallback(
    async (action: () => Promise<ActionResult<T[]>>, optimistic?: (prev: T[]) => T[]) => {
      if (!(await ensure())) return false;
      const prev = itemsRef.current;
      if (optimistic) setItems(optimistic(prev));
      let res = await action().catch(() => ({ ok: false, error: "Geen verbinding" }) as const);
      if (!res.ok && res.error === "locked") {
        markLocked();
        if (await ensure()) res = await action();
      }
      if (res.ok) {
        setItems(res.data);
        return true;
      }
      setItems(prev);
      if (res.error !== "locked") notify(res.error);
      return false;
    },
    [ensure, markLocked, notify],
  );

  return [items, mutate] as const;
}
