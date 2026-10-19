import type { Metadata } from "next";
import { TodoView } from "@/components/TodoView";
import { todayISO } from "@/lib/dates";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "To-do" };

export default async function TodoPage() {
  const [todos, lijnen] = await Promise.all([read("todos"), read("lijnen")]);
  return <TodoView initial={todos} lijnen={lijnen} today={todayISO()} />;
}
