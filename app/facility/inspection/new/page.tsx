/**
 * app/facility/inspection/new/page.tsx
 *
 * P7 — 신규 점검 시작: 카테고리 선택 → 템플릿 자동 생성
 */

import { AppShell } from "@/components/layout/AppShell";
import { ClipboardCheck } from "lucide-react";
import { NewInspectionClient } from "../_components/NewInspectionClient";
import { INSPECTION_PAGE_TITLE } from "@/lib/features/inspection/labels";

export default function NewInspectionPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                신규 점검
              </h1>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                {INSPECTION_PAGE_TITLE} — 점검 템플릿 선택
              </p>
            </div>
          </div>
        </div>

        <NewInspectionClient />
      </div>
    </AppShell>
  );
}
