/**
 * lib/features/tenant/types.ts — 멀티테넌트 SaaS 타입 정의
 *
 * Tenant = 1개 사이트/센터 (e.g., 서창지역아동센터)
 * 모든 도메인 데이터 (Staff/Children/Approval/...) 의 root scope
 */

export type TenantPlan = "basic" | "pro" | "enterprise";
export type TenantStatus = "active" | "suspended" | "deleted";

export interface Tenant {
  id: string;
  tenantCode: string;          // 사이트 아이디 (e.g., "17000004442")
  siteName: string;            // 사이트명 (e.g., "서창지역아동센터")
  defaultDomain: string;       // 기본 도메인 (e.g., "sc23.ourdomain.com")
  customDomain?: string;       // 커스텀 도메인 (e.g., "55hsxpm6fe.co.co")
  plan: TenantPlan;
  status: TenantStatus;
  startDate: string;           // YYYY-MM-DD
  expireDate?: string;
  memberLimit: number;
  storageLimit: number;        // bytes
  usedStorage: number;         // bytes
  enabledApps: string[];       // ["dashboard", "staff", ...]
  theme?: string;
  logoUrl?: string;
  ownerEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantKpi {
  totalTenants: number;
  activeTenants: number;
  totalMembers: number;
  totalStorageUsed: number;
  planDistribution: { basic: number; pro: number; enterprise: number };
}