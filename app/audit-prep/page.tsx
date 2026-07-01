/**
 * app/audit-prep/page.tsx — 평가 대비 모드
 * Async Server Component
 *
 * - tenant 확인 → 최근 30일 간 출석-돌봄일지 크로스체크 → AuditClientPage 전달
 */

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import {
  crossCheckByDateRange,
  computeAuditSummary,
  recentDays,
} from "@/lib/features/audit";
import { AuditClientPage } from "./_components/AuditClientPage";

export default async function AuditPrepPage() {
  // tenant 확인
  const tenant = await db.tenant.findFirst();
  const tenantId = tenant?.id ?? "t_acme";

  // 최근 30일 범위
  const { from, to } = recentDays(30);

  // 신호등 집계 + 충돌 목록 병렬 조회
  const [summary, conflicts] = await Promise.all([
    computeAuditSummary(tenantId),
    crossCheckByDateRange(tenantId, from, to),
  ]);

  return (
    <AppShell>
      <Suspense fallback={null}>
        <AuditClientPage
          tenantName={tenant?.name ?? "전체 센터"}
          summary={summary}
          conflicts={conflicts}
          checkedRange={{ from, to }}
        />
      </Suspense>
    </AppShell>
  );
}
