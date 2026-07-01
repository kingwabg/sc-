/**
 * app/facility/inspection/page.tsx
 *
 * P7 — 디지털 안전점검 목록 페이지 (Server Component)
 * - tenant 조회 → 점검 목록 → InspectionListClient 전달
 */

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ClipboardCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getInspectionsByTenant } from "@/lib/features/inspection";
import { InspectionListClient } from "./_components/InspectionListClient";
import {
  INSPECTION_PAGE_TITLE,
  INSPECTION_PAGE_DESC,
} from "@/lib/features/inspection/labels";

export default async function InspectionListPage() {
  const tenant = await db.tenant.findFirst();
  const tenantId = tenant?.id ?? "t_acme";

  const inspections = await getInspectionsByTenant(tenantId);

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
                {INSPECTION_PAGE_TITLE}
              </h1>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                {INSPECTION_PAGE_DESC}
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="text-sm text-slate-400">로딩 중…</div>}>
          <InspectionListClient inspections={inspections} />
        </Suspense>
      </div>
    </AppShell>
  );
}
