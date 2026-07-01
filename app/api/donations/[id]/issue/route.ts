/**
 * app/api/donations/[id]/issue/route.ts
 *
 * POST /api/donations/[id]/issue — 영수증 채번 + 발급
 *
 * 멱등: 이미 발급된 경우 기존 번호 그대로 반환
 *
 * 응답:
 *  - 200 { receiptNumber, issuedAt }
 *  - 404 { error } — 후원 없음
 *  - 500 { error }
 */

import { NextRequest, NextResponse } from "next/server";
import { issueReceipt, getDonation } from "@/lib/features/donation/data";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const exists = await getDonation(id);
  if (!exists) {
    return NextResponse.json({ error: "후원을 찾을 수 없습니다" }, { status: 404 });
  }

  try {
    const issued = await issueReceipt(id);
    return NextResponse.json({
      id: issued.id,
      receiptNumber: issued.receiptNumber,
      issuedAt: issued.issuedAt.toISOString(),
    });
  } catch (err) {
    console.error("[api/donations/id/issue]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
