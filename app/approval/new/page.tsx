/**
 * 새 결재 작성 — 양식 선택 페이지
 * 양식 카드를 보여주고 클릭 시 /approval/new/[formKey] 로 이동
 */
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "../_components/ApprovalSidebar";
import { FormCardSelector } from "./_components/FormCardSelector";

interface Props {
  searchParams: Promise<{ goto?: string }>;
}

export default async function NewApprovalSelectPage({ searchParams }: Props) {
  const params = await searchParams;
  // direct goto param for backward compat
  if (params.goto) redirect(params.goto);

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar currentFolder="new" />
        <main>
          <FormCardSelector />
        </main>
      </div>
    </AppShell>
  );
}