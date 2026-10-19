import type { Metadata } from "next";
import { KostenView } from "@/components/KostenView";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kosten" };

export default async function KostenPage() {
  return <KostenView initial={await read("kosten")} />;
}
