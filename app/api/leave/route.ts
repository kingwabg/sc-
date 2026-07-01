/**
 * app/api/leave/route.ts
 *
 * GET  /api/leave          — 휴가 목록 (query: ?staffId=, ?status=, ?year=)
 * POST /api/leave          — 휴가 신청
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getMyLeaves,
  getPendingLeaves,
  getYearStats,
  createLeave,
} from "@/lib/features/leave/data";
import type { LeaveType } from "@/lib/features/leave/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");
    const year = searchParams.get("year");

    if (staffId) {
      // 개인 휴가 목록
      const leaves = await getMyLeaves(staffId);
      return NextResponse.json(leaves);
    }

    if (status === "PENDING") {
      // 관리자: 대기 중인 휴가
      const leaves = await getPendingLeaves();
      return NextResponse.json(leaves);
    }

    if (staffId && year) {
      // 연차 통계
      const stats = await getYearStats(staffId, parseInt(year, 10));
      return NextResponse.json(stats);
    }

    // 전체 목록 (관리자용)
    const leaves = await getPendingLeaves();
    return NextResponse.json(leaves);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      staffId: string;
      type: LeaveType;
      startDate: string;
      endDate: string;
      reason?: string;
    };

    if (!body.staffId || !body.type || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "필수 필드 누락" }, { status: 400 });
    }

    const created = await createLeave({
      staffId: body.staffId,
      type: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
