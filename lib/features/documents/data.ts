/**
 * lib/features/documents/data.ts
 *
 * Prisma 기반 만료 추적 쿼리 — Server Component only
 *
 * 주의:
 *  - server-only 의존성 (PrismaClient) → client component에서 import 금지
 *  - getExpiringDocs는 tenantId + daysAhead=30 으로 호출 권장
 *  - expired/expiringSoon 분리 정렬 — UI에서 한 번에 표시 가능
 */

import "server-only";
import { db } from "@/lib/db";
import {
  todayKst,
  buildWarning,
  sortWarnings,
  docExpiryLightByCount,
} from "./utils";
import type {
  ExpiringDocsResult,
  DocExpiryLight,
  ExpiryWarning,
} from "./types";

/**
 * 만료 임박 + 만료된 문서 조회
 *
 * @param tenantId - 테넌트 ID
 * @param daysAhead - 만료 임박 윈도우 (기본 30일)
 */
export async function getExpiringDocs(
  tenantId: string,
  daysAhead: number = 30,
): Promise<ExpiringDocsResult> {
  const now = todayKst();

  // expiryDate IS NOT NULL인 문서만 — 만료 추적 대상
  const docs = await db.doc.findMany({
    where: {
      tenantId,
      expiryDate: { not: null },
    },
    select: {
      id: true,
      tenantId: true,
      title: true,
      category: true,
      sourceType: true,
      sourceId: true,
      expiryDate: true,
      authorName: true,
    },
    orderBy: { expiryDate: "asc" },
  });

  const all: ExpiryWarning[] = docs
    .filter((d): d is typeof d & { expiryDate: Date } => d.expiryDate !== null)
    .map((d) =>
      buildWarning({
        id: d.id,
        tenantId: d.tenantId,
        title: d.title,
        category: d.category,
        sourceType: d.sourceType,
        sourceId: d.sourceId,
        expiryDate: d.expiryDate,
        authorName: d.authorName,
        now,
        daysAhead,
      }),
    )
    .sort(sortWarnings);

  const expired = all.filter((w) => w.status === "EXPIRED");
  const expiringSoon = all.filter((w) => w.status === "EXPIRING_SOON");

  return {
    expired,
    expiringSoon,
    total: all.length,
    expiringSoonCount: expiringSoon.length,
    expiredCount: expired.length,
    computedAt: now.toISOString().slice(0, 10),
  };
}

/**
 * 문서 만료 신호등 — 단독 호출 (AuditSummary 외부에서도 사용 가능)
 */
export async function computeDocExpiryLight(
  tenantId: string,
  daysAhead: number = 30,
): Promise<DocExpiryLight> {
  const result = await getExpiringDocs(tenantId, daysAhead);
  return {
    expiringSoonCount: result.expiringSoonCount,
    expiredCount: result.expiredCount,
    light: docExpiryLightByCount(result.expiringSoonCount),
  };
}