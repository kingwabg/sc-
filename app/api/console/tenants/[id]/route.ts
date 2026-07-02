/**
 * app/api/console/tenants/[id]/route.ts
 *
 * GET    /api/console/tenants/[id] — 단건 조회
 * PUT    /api/console/tenants/[id] — 부분 업데이트
 * DELETE /api/console/tenants/[id] — soft delete
 *
 * 운영자(super-admin) 영역 — 모든 테넌트 cross-access 가능.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  deleteTenant,
  getTenantByIdAsync,
  updateTenant,
} from "@/lib/features/tenant/store";
import type { TenantUpdateInput } from "@/lib/features/tenant/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET — 단건 조회 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const tenant = await getTenantByIdAsync(id);
    if (!tenant) {
      return NextResponse.json({ error: "센터를 찾을 수 없습니다" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, tenant });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

/** PUT — 부분 업데이트 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: TenantUpdateInput;
  try {
    body = (await req.json()) as TenantUpdateInput;
  } catch {
    return NextResponse.json({ error: "JSON parse error" }, { status: 400 });
  }

  try {
    const updated = await updateTenant(id, body);
    if (!updated) {
      return NextResponse.json({ error: "센터를 찾을 수 없습니다" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, tenant: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

/** DELETE — soft delete */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const result = await deleteTenant(id);
    if (!result) {
      return NextResponse.json({ error: "센터를 찾을 수 없습니다" }, { status: 404 });
    }
    return NextResponse.json({ ok: result.ok, id: result.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
