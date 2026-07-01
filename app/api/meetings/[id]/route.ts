/**
 * app/api/meetings/[id]/route.ts
 *
 * GET   /api/meetings/[id] — 단일 회의 조회
 * PUT   /api/meetings/[id] — 회의 수정
 * DELETE /api/meetings/[id] — 회의 삭제
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getMeeting,
  updateMeeting,
  deleteMeeting,
} from "@/lib/features/meeting/data";
import type { MeetingUpdateInput } from "@/lib/features/meeting/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meeting = await getMeeting(id);
  if (!meeting) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(meeting);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: MeetingUpdateInput;
  try {
    body = (await req.json()) as MeetingUpdateInput;
  } catch {
    return NextResponse.json({ error: "JSON parse error" }, { status: 400 });
  }

  if (typeof body.heldAt === "string") {
    body.heldAt = new Date(body.heldAt);
  }

  try {
    const updated = await updateMeeting(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/meetings/[id] PUT]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const ok = await deleteMeeting(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/meetings/[id] DELETE]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
