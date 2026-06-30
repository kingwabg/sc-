/**
 * GET /api/health — DB 연결 헬스체크
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const counts = await Promise.all([
      prisma.tenant.count(),
      prisma.child.count(),
      prisma.staff.count(),
      prisma.approvalRequest.count(),
    ]);
    return NextResponse.json({
      ok: true,
      db: "postgresql",
      counts: {
        tenants: counts[0],
        children: counts[1],
        staff: counts[2],
        approvals: counts[3],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
