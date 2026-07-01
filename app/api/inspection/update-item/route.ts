/**
 * POST /api/inspection/update-item — 항목 결과 업데이트
 *
 * Body: { itemId, result, note? }
 * - updateItemResult 내부에서 inspection.status 자동 갱신
 */
import { NextRequest, NextResponse } from "next/server";
import { updateItemResult } from "@/lib/features/inspection";
import type { InspectionResult } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      itemId: string;
      result: InspectionResult;
      note?: string;
    };

    await updateItemResult({
      itemId: body.itemId,
      result: body.result,
      note: body.note,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
