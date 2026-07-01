/**
 * POST /api/inspection/create — 신규 점검 생성
 *
 * Body: { category, title, items: [{ label, position }] }
 * tenantId는 db.tenant.findFirst()로 자동 결정
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createInspection } from "@/lib/features/inspection";
import type { InspectionCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      category: InspectionCategory;
      title: string;
      items: { label: string; position: number }[];
    };

    const tenant = await db.tenant.findFirst();
    const tenantId = tenant?.id ?? "t_acme";

    const inspection = await createInspection({
      tenantId,
      category: body.category,
      title: body.title,
      items: body.items,
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
