/**
 * app/api/staff/route.ts
 *
 * GET  /api/staff — 종사자 목록 (tenantId 필터)
 * POST /api/staff — 종사자 신규 등록
 *
 * - tryPrisma 패턴 (DATABASE_URL 없으면 mock fallback)
 * - mock은 MOCK_STAFF 사용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MOCK_STAFF, type Staff } from "@/lib/features/staff";
import { withTenant } from "@/lib/api/withTenant";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

type CreateStaffInput = Omit<Staff, "id" | "tenantId">;

async function tryPrisma<T>(
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") ||
        err.message.includes("Environment variable"))
    ) {
      return await fallback();
    }
    console.error("[api/staff] prisma query failed:", err);
    return await fallback();
  }
}

export async function GET() {
  try {
    const list = await tryPrisma(
      async () =>
        (await prisma.staff.findMany({
          where: { tenantId: DEFAULT_TENANT },
          orderBy: { name: "asc" },
        })) as unknown as Staff[],
      async () => MOCK_STAFF,
    );
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export const POST = withTenant(async (req, _ctx, scope) => {
  let body: CreateStaffInput;
  try {
    body = (await req.json()) as CreateStaffInput;
  } catch {
    return NextResponse.json({ error: "JSON parse error" }, { status: 400 });
  }

  if (!body.name || !body.loginId) {
    return NextResponse.json(
      { error: "name/loginId 필수" },
      { status: 400 },
    );
  }

  try {
    const created = await tryPrisma(
      async () => {
        const row = await prisma.staff.create({
          data: {
            tenantId: scope.tenantId,
            name: body.name,
            loginId: body.loginId,
            gender: body.gender,
            phone: body.phone,
            position: String(body.position),
            joinDate: body.joinDate,
            email: body.email,
            status: body.status,
          },
        });
        return {
          id: row.id,
          tenantId: row.tenantId,
          name: row.name,
          loginId: row.loginId,
          gender: row.gender as "M" | "F",
          phone: row.phone,
          position: row.position as Staff["position"],
          joinDate: row.joinDate,
          email: row.email ?? undefined,
          status: row.status as Staff["status"],
        } satisfies Staff;
      },
      async () => ({
        id: `s-${Date.now()}`,
        tenantId: scope.tenantId,
        ...body,
      }),
    );
    const { tenantId: _t, ...rest } = created as Staff;
    return NextResponse.json({ ok: true, tenantId: scope.tenantId, ...rest }, { status: 201 });
  } catch (err) {
    console.error("[api/staff] POST failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
});
