/**
 * components/auth/TenantSwitcher.tsx
 *
 * P16 — TenantSwitcher dropdown 컴포넌트
 * useTenant hook + MOCK_TENANTS 사용
 * 사이드바 또는 헤더에 mount 가능
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useTenant } from "@/lib/auth/useTenant";
import { MOCK_TENANTS } from "@/lib/features/tenant";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Building2 } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-amber-100 text-amber-700",
  deleted: "bg-red-100 text-red-600",
};

export function TenantSwitcher() {
  const { tenant, setTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="사이트 전환"
        aria-expanded={open}
        className={cn(
          "flex h-10 min-w-[180px] items-center gap-2 rounded-xl border px-2.5 text-left transition",
          "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25",
        )}
      >
        {/* Tenant 아이콘 */}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
          <Building2 className="h-4 w-4 text-indigo-600" strokeWidth={2.2} />
        </span>

        {/* 현재 tenant 정보 */}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-extrabold text-slate-900">
            {tenant.siteName}
          </span>
          <span className="block truncate text-[10px] font-medium text-slate-400">
            {tenant.tenantCode}
          </span>
        </span>

        {/* Chevron */}
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400 transition",
            "group-hover:bg-slate-100 group-hover:text-slate-600",
            open ? "rotate-180" : "",
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-900">사이트 전환</div>
          </div>

          {/* Tenant 목록 */}
          <ul className="p-1.5">
            {MOCK_TENANTS.map((t) => {
              const isActive = t.id === tenant.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTenant(t.tenantCode);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      isActive ? "bg-slate-50" : "hover:bg-slate-50",
                    )}
                  >
                    {/* 아이콘 */}
                    <span
                      className={cn(
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold ring-1",
                        isActive
                          ? "bg-indigo-100 text-indigo-700 ring-indigo-200"
                          : "bg-slate-100 text-slate-500 ring-slate-200",
                      )}
                    >
                      {t.siteName.slice(0, 1)}
                    </span>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-extrabold text-slate-900">
                          {t.siteName}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black",
                            STATUS_COLORS[t.status] ?? "bg-slate-100 text-slate-500",
                          )}
                        >
                          {PLAN_LABELS[t.plan] ?? t.plan}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                        {t.tenantCode}
                      </div>
                    </div>

                    {/* Check */}
                    {isActive && (
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
