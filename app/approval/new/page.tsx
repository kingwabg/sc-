/**
 * 새 결재 작성 — 양식 선택 페이지
 * 양식 카드를 보여주고 클릭 시 /approval/new/[formKey] 로 이동
 */
import { AppShell } from "@/components/layout/AppShell";
<<<<<<< Updated upstream
import { ApprovalSidebar } from "../_components/ApprovalSidebar";
import { NewApprovalForm } from "../_components/NewApprovalForm";
import { ArrowLeft } from "lucide-react";
=======
import { ApprovalSidebar } from "../../_components/ApprovalSidebar";
import { FormCardSelector } from "./_components/FormCardSelector";
import type { ApprovalView } from "@/lib/types/approval";
import { redirect } from "next/navigation";
>>>>>>> Stashed changes

interface Props {
  searchParams: Promise<{ goto?: string }>;
}

<<<<<<< Updated upstream
  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar currentFolder="new" />
=======
export default async function NewApprovalSelectPage({ searchParams }: Props) {
  const params = await searchParams;
  // direct goto param for backward compat
  if (params.goto) redirect(params.goto);

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar
          current="new"
          onSelect={(view: ApprovalView) => {
            // server component — navigation handled by client shell
          }}
          onWrite={() => {}}
        />
>>>>>>> Stashed changes
        <main>
          <FormCardSelector />
        </main>
      </div>
    </AppShell>
  );
}
