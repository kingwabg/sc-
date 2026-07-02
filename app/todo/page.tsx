import { AppShell } from "@/components/layout/AppShell";
import { TodoBoard } from "./_components/TodoBoard";

export default function TodoPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl py-6">
        <TodoBoard />
      </div>
    </AppShell>
  );
}
