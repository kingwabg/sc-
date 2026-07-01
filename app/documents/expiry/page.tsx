/**
 * app/documents/expiry/page.tsx — 문서 만료 알림 페이지
 * Async Server Component
 *
 * - tenant 확인 → 만료 추적 대상 조회 + 신호등 계산 → DocExpiryClient 전달
 * - DB 없을 때도 throw (server-only) — fallback 없음 (P6 신규 라우트)
 */

import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import {
  getExpiringDocs,
  computeDocExpiryLight,
} from "@/lib/features/documents";
import { DocExpiryClient } from "./_components/DocExpiryClient";

export default async function DocumentsExpiryPage() {
  // tenant 확인
  const tenant = await db.tenant.findFirst();
  const tenantId = tenant?.id ?? "t_acme";

  // 만료 추적 + 신호등 병렬 계산
  const [result, light] = await Promise.all([
    getExpiringDocs(tenantId),
    computeDocExpiryLight(tenantId),
  ]);

  return (
    <AppShell>
      <DocExpiryClient result={result} light={light} />
    </AppShell>
  );
}