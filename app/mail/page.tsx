import type { Metadata } from "next";
import { MailView } from "@/components/MailView";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mail" };

export default async function MailPage() {
  const [mails, lijnen] = await Promise.all([read("mails"), read("lijnen")]);
  return <MailView initial={mails} lijnen={lijnen} />;
}
