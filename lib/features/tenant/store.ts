/**
 * lib/features/tenant/store.ts — Tenant mutation layer (server-only)
 *
 * tryPrisma 패턴:
 *   - DATABASE_URL 없거나 Prisma 미연결 → in-memory MOCK_TENANTS mutation
 *   - 연결 시 → Prisma store 시도 (현재는 스키마에 Tenant 모델 부재로 mock 우선)
 *
 * mock mutation은 메모리에만 유지 (서버 재시작 시 사라짐).
 * 운영자 콘솔 CRUD의 백엔드 store.
 */

import "server-only";
import { MOCK_TENANTS } from "./data";
import type { Tenant } from "./types";

const GB = 1024 ** 3;

export type TenantCreateInput = {
  siteName: string;
  tenantCode?: string;
  defaultDomain?: string;
  customDomain?: string;
  plan: Tenant["plan"];
  status: Tenant["status"];
  startDate: string;
  expireDate?: string;
  memberLimit: number;
  storageLimit: number;
  usedStorage?: number;
  enabledApps: string[];
  theme?: string;
  logoUrl?: string;
  ownerEmail?: string;
  notes?: string;
};

/** Prisma 가용 여부 — DATABASE_URL env 체크 (간단 버전). */
function hasPrisma(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;
}

/** 신규 ID 생성 (mock-only, prefix + timestamp + random) */
function genId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * slug → tenantCode 자동 생성 (mock).
 * - 입력 siteName 정규화 (특수문자 제거 + 영문/숫자만)
 * - 비어있으면 timestamp-based fallback
 */
function suggestCode(siteName: string): string {
  const base = siteName
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9가-힣]/g, "")
    .slice(0, 6);
  const stamp = Math.floor(Math.random() * 9000) + 1000;
  return `${base}${stamp}`;
}

/** siteName → defaultDomain 자동 생성 (영문/숫자 + ".ourdomain.com") */
function suggestDomain(siteName: string): string {
  const slug = siteName
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8) || "tenant";
  const num = Math.floor(Math.random() * 90) + 10;
  return `${slug}${num}.ourdomain.com`;
}

/** 코드 중복 체크 → +1 증가 */
function uniquifyCode(code: string): string {
  let cur = code;
  let i = 1;
  while (MOCK_TENANTS.some((t) => t.tenantCode === cur)) {
    cur = `${code}-${i}`;
    i++;
  }
  return cur;
}

/** 도메인 중복 체크 → suffix 추가 */
function uniquifyDomain(domain: string): string {
  let cur = domain;
  let i = 1;
  while (MOCK_TENANTS.some((t) => t.defaultDomain === cur || t.customDomain === cur)) {
    cur = domain.replace(/(\.ourdomain\.com)$/, `-${i}$1`);
    i++;
  }
  return cur;
}

/** tenantCode 옵셔널 → 자동 생성. */
export function deriveTenantCode(siteName: string): string {
  return uniquifyCode(suggestCode(siteName));
}

/** defaultDomain 옵셔널 → 자동 생성. */
export function deriveDefaultDomain(siteName: string): string {
  return uniquifyDomain(suggestDomain(siteName));
}

/** 전체 테넌트 목록 (mock mutation 반영) */
export async function listAllTenants(): Promise<Tenant[]> {
  if (!hasPrisma()) {
    return [...MOCK_TENANTS].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  // Prisma 사용 가능 시 — 추후 Tenant 모델 추가되면 prisma.tenant.findMany()
  return [...MOCK_TENANTS].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** ID 로 단건 조회 */
export async function getTenantByIdAsync(id: string): Promise<Tenant | null> {
  if (!hasPrisma()) {
    return MOCK_TENANTS.find((t) => t.id === id) ?? null;
  }
  return MOCK_TENANTS.find((t) => t.id === id) ?? null;
}

/** 신규 테넌트 생성 */
export async function createTenant(input: TenantCreateInput): Promise<Tenant> {
  const now = new Date().toISOString();
  const tenantCode = input.tenantCode?.trim() || deriveTenantCode(input.siteName);
  const defaultDomain = input.defaultDomain?.trim() || deriveDefaultDomain(input.siteName);

  const tenant: Tenant = {
    id: genId(),
    tenantCode,
    siteName: input.siteName,
    defaultDomain,
    customDomain: input.customDomain,
    plan: input.plan,
    status: input.status,
    startDate: input.startDate,
    expireDate: input.expireDate,
    memberLimit: input.memberLimit,
    storageLimit: input.storageLimit,
    usedStorage: input.usedStorage ?? 0,
    enabledApps: input.enabledApps,
    theme: input.theme,
    logoUrl: input.logoUrl,
    ownerEmail: input.ownerEmail,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };

  MOCK_TENANTS.unshift(tenant);
  return tenant;
}

export type TenantUpdateInput = Partial<Omit<Tenant, "id" | "createdAt">>;

/** 테넌트 부분 업데이트 */
export async function updateTenant(id: string, patch: TenantUpdateInput): Promise<Tenant | null> {
  const idx = MOCK_TENANTS.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const updated: Tenant = {
    ...MOCK_TENANTS[idx],
    ...patch,
    id: MOCK_TENANTS[idx].id,
    createdAt: MOCK_TENANTS[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  MOCK_TENANTS[idx] = updated;
  return updated;
}

/** soft delete — status: 'deleted' 로 변경 */
export async function deleteTenant(id: string): Promise<{ id: string; ok: boolean } | null> {
  const idx = MOCK_TENANTS.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  MOCK_TENANTS[idx] = {
    ...MOCK_TENANTS[idx],
    status: "deleted",
    updatedAt: new Date().toISOString(),
  };
  return { id, ok: true };
}

/** 통계 헬퍼 */
export function computeStorageGB(bytes: number): number {
  return bytes / GB;
}
