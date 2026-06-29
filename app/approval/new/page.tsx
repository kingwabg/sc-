"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "../_components/ApprovalSidebar";
import { NewApprovalForm } from "../_components/NewApprovalForm";
import { ArrowLeft } from "lucide-react";
import type { ApprovalView } from "@/lib/types/approval";

export default function NewApprovalPage() {
  const router = useRouter();

  function handleSelect(view: ApprovalView) {
    if (view === "new") return;
    if (view === "home") router.push("/approval");
    else router.push(`/approval/${view}`);
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar current="new" onSelect={handleSelect} onWrite={() => {}} />
        <main>
          <NewApprovalForm onClose={() => router.push("/approval")} />
        </main>
      </div>
    </AppShell>
  );
}