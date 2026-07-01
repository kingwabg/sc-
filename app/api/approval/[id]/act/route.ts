// app/api/approval/[id]/act/route.ts (P11-3) — 결재 진행 API (Mavis 직접)

import { NextResponse } from "next/server";
import { actOnApproval } from "@/lib/features/approval-folder";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body.action as "approve" | "reject" | "cc_confirm" | "withdraw";
  const comment = body.comment as string | undefined;

  if (!["approve", "reject", "cc_confirm", "withdraw"].includes(action)) {
    return NextResponse.json(
      { ok: false, error: "invalid_action" },
      { status: 400 }
    );
  }

  const result = await actOnApproval(id, action, comment);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ ok: true, approvalId: id });
}