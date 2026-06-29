/**
 * 기존 tenant-store.ts에서 정의되던 TenantSettings 타입 호환
 * 새 코드는 lib/store/settings에서 직접 import
 */
export type TenantSettings = {
  capacity: number;
  businessName: string;
  representative: string;
  businessRegNo: string;
};