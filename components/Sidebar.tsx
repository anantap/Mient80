"use client";

import { Activity, CalendarRange, ListChecks, Lock, LockOpen, Moon, Sun, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useEdit } from "./EditProvider";
import { Logo } from "./Logo";

const TABS = [
  { href: "/status", label: "Status", icon: Activity },
  { href: "/todo", label: "To-do", icon: ListChecks },
  { href: "/kosten", label: "Kosten", icon: Wallet },
  { href: "/planning", label: "Planning", icon: CalendarRange },
];

export function Sidebar() {
  const pathname = usePathname();
  const { required, locked, ensure } = useEdit();
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme !== "light");
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = "light";
    try {
      localStorage.setItem("mient80-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <nav className="sidebar" aria-label="Hoofdmenu">
      <Link href="/status" className="sidebar-logo" aria-label="Mient 80">
        <Logo />
      </Link>
      <ul className="sidebar-tabs">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={`tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined} title={label}>
                <Icon size={24} strokeWidth={1.75} />
                <span className="tab-label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-foot">
        {required && (
          <button
            type="button"
            className="tab"
            onClick={() => ensure()}
            title={locked ? "Ontgrendelen om te bewerken" : "Bewerken staat aan"}
            aria-label={locked ? "Ontgrendelen" : "Ontgrendeld"}
          >
            {locked ? <Lock size={20} strokeWidth={1.75} /> : <LockOpen size={20} strokeWidth={1.75} />}
            <span className="tab-label">{locked ? "Slot" : "Open"}</span>
          </button>
        )}
        <button type="button" className="tab" onClick={toggleTheme} title="Licht / donker" aria-label="Wissel thema">
          {dark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
          <span className="tab-label">Thema</span>
        </button>
      </div>
    </nav>
  );
}
