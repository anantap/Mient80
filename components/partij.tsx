import { AlarmClock, ChefHat, Flag, Hammer, House, ListChecks, Ruler, Users, Wrench, type LucideIcon } from "lucide-react";
import type { Partij, PlanItem } from "@/lib/types";

export const PARTIJ_ICON: Record<Partij, LucideIcon> = {
  multimar: Wrench,
  baboon: Ruler,
  baasklus: Hammer,
  hvdh: ChefHat,
  wij: House,
  overig: Users,
};

export function planIcon(item: Pick<PlanItem, "type" | "partij">): LucideIcon {
  if (item.type === "mijlpaal") return Flag;
  if (item.type === "deadline") return AlarmClock;
  return PARTIJ_ICON[item.partij];
}

export const TodoIcon = ListChecks;

export const PARTIJ_INITIALEN: Record<Partij, string> = {
  multimar: "MM",
  baboon: "BA",
  baasklus: "BK",
  hvdh: "HH",
  wij: "",
  overig: "…",
};
