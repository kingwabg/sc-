/**
 * app/api/console/tenants/route.ts
 *
 * GET  /api/console/tenants — 운영자 콘솔: 전체 센터 목록 (mock 5건 + 추가분)
 * POST /api/console/tenants — 신규 센터 생성
 *
 * 운영자(super-admin) 영역 — tenant cookie 무시, 모든 테넌트 cross-access.
 * Body(POSIX): {
 *   siteName, tenantCode?, defaultDomain?, customDomain?,
 *   plan, memberLimit, storageLimitGB, startDate, expireDate?,
 *   enabledApps[], ownerEmail?, notes?
 * }
 *
 * 응답:
 *  - 200 / 201: { ok: true, tenant }
 *  - 400: { error }
 *  - 500: { error }
 *
 * 패턴: tryPrisma — Prisma 미연결 시 in-memory mock fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { MOCK_TENANTS, getTenantById } from "@/lib/features/tenant/data";
import { createTenant, listAllTenants } from "@/lib/features/tenant/store";
import type { Tenant, TenantPlan, TenantStatus } from "@/lib/features/tenant/types";

export const dynamic = "force-dynamic";

/** GET — 전체 목록 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const plan = url.searchParams.get("plan") || "all";
    const status = url.searchParams.get("status") || "all";

    const result = await listAllTenants();
    const filtered = result.filter((t) => {
      if (q && !t.siteName.toLowerCase().includes(q) && !t.tenantCode.includes(q) && !t.defaultDomain.includes(q)) return false;
      if (plan !== "all" && t.plan !== plan) return false;
      if (status !== "all" && t.status !== status) return false;
      return true;
    });

    return NextResponse.json({ ok: true, tenants: filtered, total: filtered.length });
  } catch (err) {
    console.error("[api/console/tenants GET]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

/** POST — 신규 센터 생성 */
export async function POST(req: NextRequest) {
  let body: Partial<Tenant> & { storageLimitGB?: number };
  try {
    body = (await req.json()) as Partial<Tenant> & { storageLimitGB?: number };
  } catch {
    return NextResponse.json({ error: "JSON parse error" }, { status: 400 });
  }

  // ── 필수값 검증 ──
  if (!body.siteName?.trim()) {
    return NextResponse.json({ error: "사이트명은 필수입니다" }, { status: 400 });
  }
  if (!body.plan || !["basic", "pro", "enterprise"].includes(body.plan)) {
    return NextResponse.json({ error: "유효한 요금제를 선택해 주세요" }, { status: 400 });
  }
  if (!body.memberLimit || body.memberLimit < 1) {
    return NextResponse.json({ error: "회원 한도는 1명 이상이어야 합니다" }, { status: 400 });
  }
  if (!body.startDate) {
    return NextResponse.json({ error: "사용 시작일은 필수입니다" }, { status: 400 });
  }

  try {
    // storageLimitGB → bytes 변환 (없으면 plan 기본값)
    const storageGB =
      typeof body.storageLimitGB === "number" && body.storageLimitGB > 0
        ? body.storageLimitGB
        : body.plan === "enterprise"
          ? 50
          : body.plan === "pro"
            ? 10
            : 5;
    const storageLimit = storageGB * 1024 ** 3;

    const plan = body.plan as TenantPlan;
    const status: TenantStatus = body.status === "deleted" ? "deleted" : "active";

    const input = {
      siteName: body.siteName.trim(),
      tenantCode: body.tenantCode?.trim(),
      defaultDomain: body.defaultDomain?.trim(),
      customDomain: body.customDomain?.trim() || undefined,
      plan,
      status,
      startDate: body.startDate,
      expireDate: body.expireDate || undefined,
      memberLimit: body.memberLimit,
      storageLimit,
      usedStorage: 0,
      enabledApps: Array.isArray(body.enabledApps) ? body.enabledApps : [],
      ownerEmail: body.ownerEmail?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      theme: body.theme || "indigo",
    };

    const created = await createTenant(input);
    return NextResponse.json({ ok: true, tenant: created }, { status: 201 });
  } catch (err) {
    console.error("[api/console/tenants POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
