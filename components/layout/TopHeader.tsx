"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LayoutGrid, Search, Sun, Moon, Bell, Settings, ChevronDown, Check, Building2, ArrowRight } from "lucide-react";
import { useTenant } from "@/lib/tenant-context";
import { TENANT_LIST, type Tenant } from "@/lib/tenants";
import { TENANT_VISUAL } from "@/lib/features/tenants";
import {
  THEME_MODE_EVENT,
  applyThemeMode,
  getThemeMode,
  setThemeMode,
  type ThemeMode,
} from "@/lib/store";

export function TopHeader() {
  const { tenant, setTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const sync = () => {
      const mode = getThemeMode();
      applyThemeMode(mode);
      setTheme(mode);
    };
    const onThemeChange = (event: Event) => {
      const next = event instanceof CustomEvent ? event.detail : getThemeMode();
      setTheme(next === "dark" ? "dark" : "light");
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(THEME_MODE_EVENT, onThemeChange);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(THEME_MODE_EVENT, onThemeChange);
    };
  }, []);

  function onPickTenant(t: Tenant) {
    setTenant(t.id);
    setOpen(false);
    router.push("/portal");
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeMode(next);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white border-b border-slate-200 flex items-center px-6 gap-6">
      {/* Brand */}
      <Link href={tenant ? "/portal" : "/"} className="flex items-center gap-2.5 min-w-[200px]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-md shadow-brand-600/30">
          <LayoutGrid className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-slate-900 tracking-tight">Office</span>
          <span className="text-[11px] text-slate-500 mt-px">임직원 포털</span>
        </div>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-[560px] mx-auto">
        <div className="flex items-center h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15 transition">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="메뉴, 게시글, 결재문서, 임직원 검색"
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="text-[11px] text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <IconBtn
          aria-label={theme === "dark" ? "라이트모드" : "다크모드"}
          aria-pressed={theme === "dark"}
          title={theme === "dark" ? "라이트모드" : "다크모드"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Moon className="w-[18px] h-[18px]" />
          ) : (
            <Sun className="w-[18px] h-[18px]" />
          )}
        </IconBtn>
        <IconBtn aria-label="알림" badge={5}>
          <Bell className="w-[18px] h-[18px]" />
        </IconBtn>
        <IconBtn aria-label="환경설정">
          <Settings className="w-[18px] h-[18px]" />
        </IconBtn>
        <Link
          href="/settings"
          prefetch={false}
          aria-label="관리자 설정"
          title="관리자 설정"
          className="w-[38px] h-[38px] rounded-lg grid place-items-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-user">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            <path d="M9 12a3 3 0 0 0 6 0"/>
            <circle cx="12" cy="10" r="1"/>
          </svg>
        </Link>
        <div className="w-px h-5 bg-slate-200 mx-2" />

        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="사이트 전환"
            aria-expanded={open}
            className={[
              "group flex h-10 min-w-[176px] items-center gap-2 rounded-xl border px-2 text-left transition",
              "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/25",
            ].join(" ")}
          >
            {tenant ? (
              <>
                <TenantIcon tenant={tenant} size="sm" shape="rounded" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-extrabold text-slate-900">{tenant.label}</span>
                  <span className="block truncate text-[10px] font-bold text-slate-400">
                    {tenant.type === "facility" ? "돌봄 시설" : "교육 기관"}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-extrabold text-slate-900">사이트 선택</span>
                  <span className="block truncate text-[10px] font-bold text-slate-400">운영 공간</span>
                </span>
              </>
            )}
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-slate-100">
              <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
            </span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Workspace</div>
                <div className="mt-1 text-sm font-extrabold text-slate-900">사이트 전환</div>
              </div>
              <ul className="p-2">
                {TENANT_LIST.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => onPickTenant(t)}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                        tenant?.id === t.id ? "bg-slate-50" : "hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <TenantIcon tenant={t} size="md" shape="rounded" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-[13px] font-extrabold text-slate-900">{t.label}</div>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${t.accent.bg} ${t.accent.text}`}>
                            {t.type === "facility" ? "시설" : "학원"}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{t.subtitle}</div>
                      </div>
                      {tenant?.id === t.id && (
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                href="/"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                전체 사이트 선택 화면으로 이동
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function TenantIcon({
  tenant,
  size,
  shape,
}: {
  tenant: Tenant;
  size: "sm" | "md";
  shape: "circle" | "rounded";
}) {
  const Icon = TENANT_VISUAL[tenant.id].icon;
  const sizeClass = size === "sm" ? "w-[30px] h-[30px]" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <span
      className={`${sizeClass} ${shapeClass} ${TENANT_VISUAL[tenant.id].iconClassName} grid shrink-0 place-items-center ring-1`}
    >
      <Icon className={iconSize} strokeWidth={2.2} />
    </span>
  );
}

function IconBtn({
  children,
  badge,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { badge?: number }) {
  return (
    <button
      {...props}
      className="relative w-[38px] h-[38px] rounded-lg grid place-items-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
    >
      {children}
      {badge ? (
        <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center border-2 border-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
