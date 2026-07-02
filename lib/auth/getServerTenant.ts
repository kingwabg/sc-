/**
 * lib/auth/getServerTenant.ts
 *
 * Server-side tenant resolver.
 * 쿠키 `officex-tenant` (tenantCode) 를 읽어 MOCK_TENANTS 에서 일치하는 tenant 찾기.
 * 쿠키 없거나 매칭 안 되면 default (t-001 서창지역아동센터) 반환.
 *
 * 사용처: app/leave/page.tsx, app/leave/annual/page.tsx 등 Server Component 에서
 *        mock data filtering용.
 */

import { cookies } from "next/headers";
import { MOCK_TENANTS } from "@/lib/features/tenant/data";
import type { Tenant } from "@/lib/features/tenant/types";

const TENANT_COOKIE = "officex-tenant";
const DEFAULT_TENANT = MOCK_TENANTS[0]; // t-001 서창지역아동센터

export interface ServerTenant {
  tenantId: string;
  tenantCode: string;
  siteName: string;
  tenant: Tenant;
}

/**
 * 쿠키에서 tenantCode 읽기 → MOCK_TENANTS 매칭 → ServerTenant 반환.
 * Server Component (async) 에서만 사용.
 */
export async function getServerTenant(): Promise<ServerTenant> {
  const cookieStore = await cookies();
  const tenantCode = cookieStore.get(TENANT_COOKIE)?.value;

  if (tenantCode) {
    const tenant = MOCK_TENANTS.find((t) => t.tenantCode === tenantCode);
    if (tenant) {
      return {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        siteName: tenant.siteName,
        tenant,
      };
    }
  }

  return {
    tenantId: DEFAULT_TENANT.id,
    tenantCode: DEFAULT_TENANT.tenantCode,
    siteName: DEFAULT_TENANT.siteName,
    tenant: DEFAULT_TENANT,
  };
}
