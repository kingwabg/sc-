/**
 * lib/auth/useTenant.ts
 *
 * P16 — 사이트(tenant) 전환용 cookie 기반 hook
 * 쿠키 `officex-tenant` 에서 tenantCode 읽기
 * default = t-001 (서창지역아동센터, 17000004442)
 *
 * SSR-safe: typeof window 체크 포함
 */

"use client";

import { useState, useEffect } from "react";
import { MOCK_TENANTS, type Tenant } from "@/lib/features/tenant";

const TENANT_COOKIE = "officex-tenant";
const DEFAULT_TENANT_CODE = "17000004442"; // t-001 서창지역아동센터

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function useTenant(): {
  tenant: Tenant;
  setTenant: (tenantCode: string) => void;
} {
  const [tenantCode, setTenantCode] = useState<string>(DEFAULT_TENANT_CODE);

  useEffect(() => {
    // 클라이언트에서만 쿠키 읽기
    const stored = getCookie(TENANT_COOKIE);
    if (stored) {
      setTenantCode(stored);
    }
  }, []);

  const tenant =
    MOCK_TENANTS.find((t) => t.tenantCode === tenantCode) ?? MOCK_TENANTS[0];

  const setTenant = (newCode: string) => {
    document.cookie = `${TENANT_COOKIE}=${newCode}; path=/; max-age=31536000; SameSite=Lax`;
    setTenantCode(newCode);
    // 페이지 새로고침으로 새 tenant 컨텍스트 반영
    window.location.reload();
  };

  return { tenant, setTenant };
}
