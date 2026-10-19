const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

/** Centen → "€ 1.234,56" */
export function fmtEuro(cents: number): string {
  return euro.format(cents / 100);
}

/** "1.234,56", "1234,56", "1234.56" of "€ 1.234" → centen. null bij ongeldige invoer. */
export function parseEuro(input: string): number | null {
  let s = input.replace(/[€\s ]/g, "");
  if (s === "") return 0;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (!/^\d+\.\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Centen → invoerwaarde "1234,56" */
export function euroInput(cents: number): string {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
