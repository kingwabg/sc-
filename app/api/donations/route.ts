/**
 * app/api/donations/route.ts
 *
 * POST /api/donations — 신규 후원 등록
 * GET  /api/donations — 후원 목록 (테스트/POC용)
 *
 * POST body:
 *  {
 *    donorName: string,
 *    donorContact?: string | null,
 *    type: "CASH" | "GOODS",
 *    amount?: number,        // CASH일 때
 *    itemName?: string,      // GOODS일 때
 *    itemQty?: number,       // GOODS일 때
 *    receivedAt?: string,    // YYYY-MM-DD
 *    notes?: string | null,
 *  }
 *
 * 응답:
 *  - 201 { id, ...Donation }
 *  - 400 { error }
 *  - 500 { error }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createDonation,
} from "@/lib/features/donation/data";
import { validateDonationInput } from "@/lib/features/donation/utils";
import type { DonationInput } from "@/lib/features/donation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { listDonations } = await import("@/lib/features/donation/data");
    const result = await listDonations();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: DonationInput;
  try {
    body = (await req.json()) as DonationInput;
  } catch {
    return NextResponse.json({ error: "JSON parse error" }, { status: 400 });
  }

  const validationError = validateDonationInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // receivedAt: YYYY-MM-DD 문자열 → Date
  if (body.receivedAt && typeof body.receivedAt === "string") {
    body.receivedAt = new Date(`${body.receivedAt}T09:00:00`);
  }

  try {
    const created = await createDonation(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[api/donations POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
