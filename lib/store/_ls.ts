/**
 * localStorage 헬퍼 — SSR-safe
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readLS<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLS<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota 초과 등 무시
  }
}

export function removeLS(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

/** 동일 키의 partial을 머지 */
export function patchLS<T extends Record<string, unknown>>(
  key: string,
  patch: Partial<T>,
): T {
  const cur = readLS<T>(key, {} as T);
  const next = { ...cur, ...patch } as T;
  writeLS(key, next);
  return next;
}