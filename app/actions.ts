"use server";

import { cookies } from "next/headers";
import { canEdit, codeRequired, EDIT_COOKIE, tokenFor } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { cleanKost, cleanLijn, cleanPlanItem, cleanTodo } from "@/lib/sanitize";
import { remove, upsert } from "@/lib/store";
import type { ActionResult, CollectionName, Collections } from "@/lib/types";

async function guarded<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  if (!(await canEdit())) return { ok: false, error: "locked" };
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Opslaan mislukt" };
  }
}

export async function unlock(code: string): Promise<boolean> {
  if (!codeRequired()) return true;
  const expected = (process.env.EDIT_CODE ?? "").trim();
  if (typeof code !== "string" || code.trim() !== expected) return false;
  const jar = await cookies();
  jar.set(EDIT_COOKIE, tokenFor(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return true;
}

export async function saveLijn(raw: Record<string, unknown>) {
  return guarded(() => upsert("lijnen", cleanLijn(raw, todayISO())));
}

export async function saveTodo(raw: Record<string, unknown>) {
  return guarded(() => upsert("todos", cleanTodo(raw, todayISO())));
}

export async function saveKost(raw: Record<string, unknown>) {
  return guarded(() => upsert("kosten", cleanKost(raw)));
}

export async function savePlanItem(raw: Record<string, unknown>) {
  return guarded(() => upsert("planning", cleanPlanItem(raw)));
}

export async function deleteItem<K extends CollectionName>(
  name: K,
  id: string,
): Promise<ActionResult<Collections[K]>> {
  if (!["lijnen", "todos", "kosten", "planning"].includes(name)) {
    return { ok: false, error: "Onbekende collectie" };
  }
  return guarded(() => remove(name, String(id)));
}
