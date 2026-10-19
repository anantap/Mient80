import type { Metadata } from "next";
import { PlanningView } from "@/components/PlanningView";
import { todayISO } from "@/lib/dates";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Planning" };

export default async function PlanningPage() {
  return <PlanningView initial={await read("planning")} today={todayISO()} />;
}
