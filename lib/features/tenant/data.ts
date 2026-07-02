/**
 * lib/features/tenant/data.ts — Tenant mock + 헬퍼
 *
 * tryPrisma 패턴 — DB 연결 시 자동 전환, 미연결 시 in-memory mock.
 */

import type { Tenant, TenantKpi } from "./types";

export const MOCK_TENANTS: Tenant[] = [
  {
    id: "t-001",
    tenantCode: "17000004442",
    siteName: "서창지역아동센터",
    defaultDomain: "sc23.ourdomain.com",
    customDomain: "55hsxpm6fe.co.co",
    plan: "pro",
    status: "active",
    startDate: "2024-01-01",
    expireDate: "2026-12-31",
    memberLimit: 50,
    storageLimit: 10_737_418_240, // 10GB
    usedStorage: 3_221_225_472,   // ~3GB
    enabledApps: ["dashboard", "staff", "children", "approval", "attendance", "donation", "meeting", "inspection", "leave", "accounting"],
    theme: "emerald",
    ownerEmail: "seochang@example.com",
    notes: "서울시 강남구 소재",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "t-002",
    tenantCode: "17000008765",
    siteName: "행당지역아동센터",
    defaultDomain: "hd01.ourdomain.com",
    plan: "basic",
    status: "active",
    startDate: "2025-03-15",
    expireDate: "2027-03-14",
    memberLimit: 20,
    storageLimit: 5_368_709_120, // 5GB
    usedStorage: 1_073_741_824,   // ~1GB
    enabledApps: ["dashboard", "staff", "children", "approval"],
    ownerEmail: "haengdang@example.com",
    notes: "서울시 성동구 소재",
    createdAt: "2025-03-15T00:00:00Z",
    updatedAt: "2026-06-15T00:00:00Z",
  },
  {
    id: "t-003",
    tenantCode: "17000001234",
    siteName: "마포행복지역아동센터",
    defaultDomain: "mp01.ourdomain.com",
    customDomain: "mapohappy.kr",
    plan: "enterprise",
    status: "active",
    startDate: "2023-09-01",
    expireDate: "2028-08-31",
    memberLimit: 100,
    storageLimit: 53_687_091_200, // 50GB
    usedStorage: 21_474_836_480,   // ~20GB
    enabledApps: ["dashboard", "staff", "children", "approval", "attendance", "donation", "meeting", "inspection", "leave", "accounting", "audit", "calendar", "todo"],
    ownerEmail: "mapo@example.com",
    notes: "본점 + 2개 분소",
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2026-07-02T00:00:00Z",
  },
  {
    id: "t-004",
    tenantCode: "17000005678",
    siteName: "양산지역아동센터",
    defaultDomain: "ys01.ourdomain.com",
    plan: "pro",
    status: "suspended",
    startDate: "2025-06-01",
    expireDate: "2026-05-31",
    memberLimit: 30,
    storageLimit: 10_737_418_240,
    usedStorage: 4_294_967_296,
    enabledApps: ["dashboard", "staff", "children"],
    ownerEmail: "yangsan@example.com",
    notes: "연체 — 일시 정지",
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "t-005",
    tenantCode: "17000009012",
    siteName: "제주푸른지역아동센터",
    defaultDomain: "jj01.ourdomain.com",
    plan: "basic",
    status: "active",
    startDate: "2026-01-15",
    expireDate: "2027-01-14",
    memberLimit: 20,
    storageLimit: 5_368_709_120,
    usedStorage: 536_870_912,    // ~512MB
    enabledApps: ["dashboard", "staff", "children", "approval"],
    ownerEmail: "jeju@example.com",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
];

export function getTenantById(id: string): Tenant | undefined {
  return MOCK_TENANTS.find((t) => t.id === id);
}

export function getTenantByCode(code: string): Tenant | undefined {
  return MOCK_TENANTS.find((t) => t.tenantCode === code);
}

export function getTenantByDomain(host: string): Tenant | undefined {
  const normalized = host.split(":")[0];
  return MOCK_TENANTS.find(
    (t) => t.defaultDomain === normalized || t.customDomain === normalized,
  );
}

export function getTenantKpi(): TenantKpi {
  const totalTenants = MOCK_TENANTS.length;
  const activeTenants = MOCK_TENANTS.filter((t) => t.status === "active").length;
  const totalMembers = MOCK_TENANTS.reduce((sum, t) => sum + t.memberLimit, 0);
  const totalStorageUsed = MOCK_TENANTS.reduce((sum, t) => sum + t.usedStorage, 0);
  const planDistribution = MOCK_TENANTS.reduce(
    (acc, t) => ({ ...acc, [t.plan]: (acc[t.plan] || 0) + 1 }),
    { basic: 0, pro: 0, enterprise: 0 },
  );
  return { totalTenants, activeTenants, totalMembers, totalStorageUsed, planDistribution };
}