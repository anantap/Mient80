import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const EDIT_COOKIE = "mient80_edit";

function editCode(): string {
  return (process.env.EDIT_CODE ?? "").trim();
}

export function codeRequired(): boolean {
  return editCode() !== "";
}

export function tokenFor(code: string): string {
  return createHash("sha256").update(`mient80:${code}`).digest("hex");
}

export async function canEdit(): Promise<boolean> {
  const code = editCode();
  if (!code) return true;
  const jar = await cookies();
  return jar.get(EDIT_COOKIE)?.value === tokenFor(code);
}
