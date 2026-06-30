/**
 * GET/POST /api/children — children CRUD
 *
 * GET: list (with cardMeta/physical/observations nested)
 * POST: create
 */
import { NextRequest, NextResponse } from "next/server";
import { listChildren, addChild } from "@/lib/features/children/db";
import type { Child } from "@/lib/features/children/types";

export async function GET() {
  try {
    const children = await listChildren();
    return NextResponse.json(children);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<Child, "id">;
    const created = await addChild(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
