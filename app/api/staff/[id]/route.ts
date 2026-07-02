/**
 * app/api/staff/[id]/route.ts
 *
 * GET /api/staff/[id] — 종사자 단건 조회
 * PUT /api/staff/[id] — 종사자 수정
 *
 * - tryPrisma 패턴 + mock fallback (MOCK_STAFF)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MOCK_STAFF, type Staff } from "@/lib/features/staff";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

type UpdateStaffInput = Partial<Omit<Staff, "id" | "tenantId">>;

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
    console.error("[api/staff/[id]] prisma query failed:", err);
    return await fallback();
  }
}

function toStaff(row: {
  id: string;
  tenantId: string;
  name: string;
  loginId: string;
  gender: string;
  phone: string;
  position: string;
  joinDate: string;
  email: string | null;
  status: string;
}): Staff {
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
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const staff = await tryPrisma(
      async () => {
        const row = await prisma.staff.findFirst({
          where: { id, tenantId: DEFAULT_TENANT },
        });
        return row ? toStaff(row) : null;
      },
      () => MOCK_STAFF.find((s) => s.id === id) ?? null,
    );
    if (!staff) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(staff);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: UpdateStaffInput;
  try {
    body = (await req.json()) as UpdateStaffInput;
  } catch {
    return NextResponse.json({ error: "JSON parse error" }, { status: 400 });
  }

  try {
    const updated = await tryPrisma(
      async () => {
        const row = await prisma.staff.update({
          where: { id },
          data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.loginId !== undefined && { loginId: body.loginId }),
            ...(body.gender !== undefined && { gender: body.gender }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.position !== undefined && {
              position: String(body.position),
            }),
            ...(body.joinDate !== undefined && { joinDate: body.joinDate }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.status !== undefined && { status: body.status }),
          },
        });
        return toStaff(row);
      },
      () => {
        const idx = MOCK_STAFF.findIndex((s) => s.id === id);
        if (idx === -1) {
          return { ...MOCK_STAFF[0], ...body, id } satisfies Staff;
        }
        return { ...MOCK_STAFF[idx], ...body, id } satisfies Staff;
      },
    );
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/staff/[id]] PUT failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
