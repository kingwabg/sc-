"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "../_components/ApprovalSidebar";
import { NewApprovalForm } from "../_components/NewApprovalForm";
import { ArrowLeft } from "lucide-react";

export default function NewApprovalPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar currentFolder="new" />
        <main>
          <NewApprovalForm onClose={() => router.push("/approval")} />
        </main>
      </div>
    </AppShell>
  );
}
