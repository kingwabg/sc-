/**
 * withTenant — API route 핸들러를 tenant scope 으로 감싸는 helper.
 *
 * - cookie `officex-tenant` 에서 tenantCode 읽기
 * - 미인증/미설정 → mock tenant "t-001" fallback
 * - scope.tenantId 를 handler 에 전달
 *
 * 사용 예:
 *   export const POST = withTenant<{ params: Promise<{...}> }>(
 *     async (req, _ctx, scope) => {
 *       return NextResponse.json({ ok: true, tenantId: scope.tenantId });
 *     }
 *   );
 */

import { NextRequest, NextResponse } from "next/server";
import { MOCK_TENANTS } from "@/lib/features/tenant";

const TENANT_COOKIE = "officex-tenant";
const DEFAULT_TENANT_CODE = "17000004442";

export type TenantScope = {
  tenantId: string;
  tenantCode: string;
};

/** request 의 cookie → tenant scope 해석 (없으면 mock fallback) */
export function getTenantFromRequest(req: NextRequest): TenantScope {
  const code = req.cookies.get(TENANT_COOKIE)?.value || DEFAULT_TENANT_CODE;
  const tenant =
    MOCK_TENANTS.find((t) => t.tenantCode === code) ?? MOCK_TENANTS[0];
  return { tenantId: tenant.id, tenantCode: tenant.tenantCode };
}

/**
 * Route handler wrapper — handler 시그니처에 TenantScope 를 추가 인자로 주입.
 * T = Next.js route context 타입 (보통 `{ params: Promise<{...}> }`).
 */
export function withTenant<T = unknown>(
  handler: (
    req: NextRequest,
    ctx: T,
    scope: TenantScope,
  ) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest, ctx: T) => {
    const scope = getTenantFromRequest(req);
    return handler(req, ctx, scope);
  };
}

/**
 * JSON body 에 tenantId 자동 주입.
 * - POST/PUT/PATCH 의 body 파싱 + tenant scope merge 한 번에 처리.
 */
export async function readJsonWithTenant<T = Record<string, unknown>>(
  req: NextRequest,
): Promise<T & { tenantId: string }> {
  const scope = getTenantFromRequest(req);
  const body = (await req.json().catch(() => ({}))) as T;
  return { ...body, tenantId: scope.tenantId };
}
