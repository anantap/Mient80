import type { Metadata } from "next";
import { StatusView } from "@/components/StatusView";
import { todayISO } from "@/lib/dates";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Status" };

export default async function StatusPage() {
  const [lijnen, planning, todos] = await Promise.all([read("lijnen"), read("planning"), read("todos")]);
  return <StatusView initial={lijnen} planning={planning} todos={todos} today={todayISO()} />;
}
