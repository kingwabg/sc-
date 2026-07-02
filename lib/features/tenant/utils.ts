/**
 * lib/features/tenant/utils.ts — Tenant 유틸
 */

export function formatStorage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function formatBytes(bytes: number): string {
  return formatStorage(bytes);
}

export function isExpired(expireDate?: string): boolean {
  if (!expireDate) return false;
  return new Date(expireDate) < new Date();
}

export function daysUntilExpire(expireDate?: string): number | null {
  if (!expireDate) return null;
  const diff = new Date(expireDate).getTime() - new Date().getTime();
  return Math.ceil(diff / 86_400_000);
}

export function storagePercent(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(100, (used / limit) * 100);
}