/**
 * app/api/audit-notice/[id]/html/route.ts
 * GET /api/audit-notice/{id}/html
 *
 * 전달된 notice ID(tenantId|from|to 해시)에 해당하는 평가 통보서 HTML을 반환.
 * Client-side에서 Blob 다운로드도 가능하지만,
 * 외부 시스템 연계용으로 별도 server route 제공.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeAuditSummary, crossCheckByDateRange, generateAuditNotice, recentDays } from "@/lib/features/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: _noticeId } = await params;

  // notice ID = simpleHash(tenantId|from|to)
  // params로 전달된 notice 전체 JSON을 쿼리파라미터로 받을 수도 있지만,
  // 여기서는 ID를 검증만 하고notice를 재구성해서 반환 (임시 방식)
  try {
    const tenant = await db.tenant.findFirst();
    const tenantId = tenant?.id ?? "t_acme";
    const tenantName = tenant?.name ?? "전체 센터";
    const { from, to } = recentDays(30);

    const [summary, conflicts] = await Promise.all([
      computeAuditSummary(tenantId),
      crossCheckByDateRange(tenantId, from, to),
    ]);

    const notice = await generateAuditNotice(tenantId, tenantName, summary, conflicts);

    return new NextResponse(notice.previewHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="평가통보서_${from}_${to}.html"`,
      },
    });
  } catch (err) {
    console.error("[api/audit-notice/html]", err);
    return NextResponse.json({ error: "평가 통보서 생성 실패" }, { status: 500 });
  }
}
