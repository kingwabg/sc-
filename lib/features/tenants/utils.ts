// Multi-tenant helpers
import type { Tenant } from "./types";
import { TENANTS } from "./data";

export function getTenant(id: string | null | undefined): Tenant | null {
  if (!id) return null;
  return (TENANTS as Record<string, Tenant>)[id] ?? null;
}

export function getGreetingByTime(t: Tenant): string {
  const h = new Date().getHours();
  if (h < 12) return t.greeting.morning;
  if (h < 18) return t.greeting.afternoon;
  return t.greeting.evening;
}
