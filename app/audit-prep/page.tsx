/**
 * app/audit-prep/page.tsx — 평가 대비 모드
 * Async Server Component
 *
 * - tenant 확인 → 최근 30일 간 출석-돌봄일지 크로스체크 → AuditClientPage 전달
 */

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  crossCheckByDateRange,
  computeAuditSummary,
  generateAuditNotice,
  recentDays,
} from "@/lib/features/audit";
import { AuditClientPage } from "./_components/AuditClientPage";

async function getTenantSnapshot(): Promise<{ tenantId: string; tenantName: string }> {
  try {
    const { db } = await import("@/lib/db");
    const tenant = await db.tenant.findFirst();
    return {
      tenantId: tenant?.id ?? "t_acme",
      tenantName: tenant?.name ?? "전체 센터",
    };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") ||
        err.message.includes("DIRECT_DATABASE_URL") ||
        err.message.includes("Environment variable") ||
        err.message.includes("ECONNREFUSED"))
    ) {
      return {
        tenantId: "t_acme",
        tenantName: "지역아동센터",
      };
    }
    throw err;
  }
}

export default async function AuditPrepPage() {
  // tenant 확인
  const { tenantId, tenantName } = await getTenantSnapshot();

  // 최근 30일 범위
  const { from, to } = recentDays(30);

  // 신호등 집계 + 충돌 목록 병렬 조회
  const [summary, conflicts] = await Promise.all([
    computeAuditSummary(tenantId),
    crossCheckByDateRange(tenantId, from, to),
  ]);

  // 평가 통보서 미리 생성
  const notice = await generateAuditNotice(tenantId, tenantName, summary, conflicts);

  return (
    <AppShell>
      <Suspense fallback={null}>
        <AuditClientPage
          tenantName={tenantName}
          summary={summary}
          conflicts={conflicts}
          checkedRange={{ from, to }}
          notice={notice}
        />
      </Suspense>
    </AppShell>
  );
}
