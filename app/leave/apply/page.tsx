import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaveSidebar } from "@/components/layout/LeaveSidebar";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

export default function LeaveApplyPage() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <Suspense fallback={null}>
          <LeaveSidebar />
        </Suspense>
        <div className="min-w-0">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-4">
              <Plus className="w-7 h-7" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-2">휴가 신청</h1>
            <p className="text-sm text-slate-500 mb-6">
              휴가 신청 기능은 전자결재 연동을 통해 제공됩니다.
            </p>
            <Link
              href="/approval/new"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              전자결재로 신청하기
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
