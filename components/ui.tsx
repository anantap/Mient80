"use client";

import { Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { fmtWeekRange, isoWeek } from "@/lib/dates";

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <div className="eyebrow">Mient 80 · keuken</div>
        <h1 className="display">{title}</h1>
      </div>
      {children && <div className="page-head-actions">{children}</div>}
    </header>
  );
}

export function WeekNav({ monday, onShift }: { monday: string; onShift: (weeks: number) => void }) {
  const { week } = isoWeek(monday);
  return (
    <div className="weeknav">
      <button type="button" className="icon-btn" onClick={() => onShift(-1)} aria-label="Vorige week">
        <ChevronLeft size={16} />
      </button>
      <button type="button" className="weeknav-label" onClick={() => onShift(0)} title="Naar deze week">
        Week {week} · {fmtWeekRange(monday)}
      </button>
      <button type="button" className="icon-btn" onClick={() => onShift(1)} aria-label="Volgende week">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/** Pill met stip: kleur én vorm verschillen per toon. */
export function Pill({
  tone,
  children,
  onClick,
  title,
}: {
  tone: string;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  const content = (
    <>
      <span className={`dot dot-${tone}`} aria-hidden>
        {(tone === "klaar" || tone === "betaald") && <Check size={9} strokeWidth={4} />}
      </span>
      {children}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={`pill pill-${tone} pill-btn`} onClick={onClick} title={title}>
        {content}
      </button>
    );
  }
  return <span className={`pill pill-${tone}`}>{content}</span>;
}

/** Verwijderknop met bevestiging in de pagina. */
export function DeleteButton({ onConfirm, label = "Verwijderen" }: { onConfirm: () => void; label?: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className="btn btn-ghost-danger" onClick={() => setAsking(true)}>
        <Trash2 size={16} /> {label}
      </button>
    );
  }
  return (
    <div className="confirm" role="alert">
      <span>Zeker weten?</span>
      <button type="button" className="btn btn-danger" onClick={onConfirm}>
        Ja, verwijderen
      </button>
      <button type="button" className="btn" onClick={() => setAsking(false)}>
        Nee
      </button>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden />
      <span>{children}</span>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? "active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
