/**
 * Tenant 설정 (시설 정원/사업자 정보)
 */
import { readLS, writeLS } from "./_ls";

export type TenantSettings = {
  capacity: number;
  businessName: string;
  representative: string;
  businessRegNo: string;
};

const SETTINGS_KEY = "officex:tenant-settings";

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  capacity: 50,
  businessName: "(주)오피스",
  representative: "김민수",
  businessRegNo: "000-00-00000",
};

export function getTenantSettings(): TenantSettings {
  return readLS<TenantSettings>(SETTINGS_KEY, DEFAULT_TENANT_SETTINGS);
}

export function saveTenantSettings(partial: Partial<TenantSettings>): TenantSettings {
  const current = getTenantSettings();
  const next = { ...current, ...partial };
  writeLS(SETTINGS_KEY, next);
  return next;
}