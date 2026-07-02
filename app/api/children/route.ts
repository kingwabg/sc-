/**
 * GET/POST /api/children — children CRUD
 *
 * GET: list (with cardMeta/physical/observations nested)
 * POST: create (tenant scope 자동 주입)
 */
import { NextRequest, NextResponse } from "next/server";
import { listChildren, addChild } from "@/lib/features/children/db";
import type { Child } from "@/lib/features/children/types";
import { withTenant } from "@/lib/api/withTenant";

export async function GET() {
  try {
    const children = await listChildren();
    return NextResponse.json(children);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export const POST = withTenant<{ params: Promise<Record<string, never>> }>(async (req, _ctx, scope) => {
  try {
    const body = (await req.json()) as Omit<Child, "id" | "tenantId">;
    const created = await addChild({ ...body, tenantId: scope.tenantId } as Omit<Child, "id">);
    const { tenantId: _t, ...rest } = created as Child;
    return NextResponse.json({ ok: true, tenantId: scope.tenantId, ...rest }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
});
