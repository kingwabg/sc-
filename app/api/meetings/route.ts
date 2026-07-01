/**
 * app/api/meetings/route.ts
 *
 * GET  /api/meetings — 회의 목록 (테스트/POC용)
 * POST /api/meetings — 신규 회의록 생성
 *
 * POST body (MeetingInput):
 *  {
 *    type: "CHILD_COUNCIL" | "GOVERNANCE" | "STAFF",
 *    title: string,
 *    heldAt: string (ISO),
 *    location?: string | null,
 *    agenda?: string[],
 *    content?: string | null,
 *    attendees?: string[],
 *    absent?: string[],
 *    decisions?: string[],
 *  }
 *
 * 응답:
 *  - 201 { meeting, spawnedApproval } (GOVERNANCE면 spawnedApproval 채워짐)
 *  - 400 { error }
 *  - 500 { error }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listMeetings,
  createMeeting,
} from "@/lib/features/meeting/data";
import { validateMeetingInput } from "@/lib/features/meeting/utils";
import type { MeetingInput } from "@/lib/features/meeting/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await listMeetings();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: MeetingInput;
  try {
    body = (await req.json()) as MeetingInput;
  } catch {
    return NextResponse.json({ error: "JSON parse error" }, { status: 400 });
  }

  // heldAt: ISO 문자열 → Date
  if (typeof body.heldAt === "string") {
    body.heldAt = new Date(body.heldAt);
  }

  const validationError = validateMeetingInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const result = await createMeeting(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/meetings POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}