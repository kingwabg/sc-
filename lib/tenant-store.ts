/**
 * Tenant Store — lib/store/index.ts의 호환 re-export
 *
 * 새 코드: `import { ... } from "@/lib/store"`
 * 기존 코드: `import { ... } from "@/lib/tenant-store"` (이 re-export 통해 동작)
 */

export * from "./store";

// 기존 코드 호환: TenantSettings 타입을 기존 경로에서 다시 export
export type { TenantSettings } from "./tenant-store-types";