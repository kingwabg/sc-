/**
 * app/api/leave/[id]/route.ts
 *
 * GET    /api/leave/[id]  — 단일 휴가 조회
 * PATCH  /api/leave/[id]  — 승인/반려/취소
 *
 * PATCH body:
 *   { action: "approve" | "reject" | "cancel", approverName?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getMyLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
} from "@/lib/features/leave/data";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    // 단건 조회는 staffId 필요 → mock 범위 내에서 id 필터
    // 실 DB에서는 getLeaveById(id) 추가
    const leaves = await getMyLeaves("s_1"); // mock scope
    const found = leaves.find((l) => l.id === id);
    if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(found);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      action: "approve" | "reject" | "cancel";
      approverName?: string;
    };

    let result;
    switch (body.action) {
      case "approve":
        result = await approveLeave(id, body.approverName ?? "所长");
        break;
      case "reject":
        result = await rejectLeave(id, body.approverName ?? "所长");
        break;
      case "cancel":
        result = await cancelLeave(id);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
