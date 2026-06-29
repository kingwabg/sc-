"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LayoutGrid, Search, Sun, Bell, Settings, ChevronDown, Check, Building2 } from "lucide-react";
import { useTenant } from "@/lib/tenant-context";
import { TENANT_LIST, type Tenant } from "@/lib/tenants";

export function TopHeader() {
  const { tenant, setTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onPickTenant(t: Tenant) {
    setTenant(t.id);
    setOpen(false);
    router.push("/portal");
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
        <IconBtn aria-label="다크모드">
          <Sun className="w-[18px] h-[18px]" />
        </IconBtn>
        <IconBtn aria-label="알림" badge={5}>
          <Bell className="w-[18px] h-[18px]" />
        </IconBtn>
        <IconBtn aria-label="환경설정">
          <Settings className="w-[18px] h-[18px]" />
        </IconBtn>
        <Link
          href="/settings"
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

        {/* Tenant switcher */}
        <div ref={ref} className="relative flex items-center gap-1">
          {/* 사업장 이름/아이콘 — 클릭하면 사업자 선택 페이지로 */}
          <Link
            href="/"
            className={`flex items-center gap-2 py-1 pl-1 pr-2 rounded-full transition ${
              tenant ? `${tenant.accent.bg} hover:brightness-95` : "hover:bg-slate-50"
            }`}
            title="사업자 선택 페이지로 이동"
          >
            {tenant ? (
              <>
                <span className={`w-[30px] h-[30px] rounded-full bg-gradient-to-br ${tenant.gradient} text-white grid place-items-center text-base`}>
                  {tenant.emoji}
                </span>
                <span className={`text-[13px] font-semibold ${tenant.accent.text} hover:underline`}>
                  {tenant.label}
                </span>
              </>
            ) : (
              <>
                <span className="w-[30px] h-[30px] rounded-full bg-slate-200 text-slate-600 grid place-items-center">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-[13px] font-semibold text-slate-700 hover:underline">사이트 선택</span>
              </>
            )}
          </Link>
          {/* 드롭다운 토글 */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="사이트 목록 열기"
            className={`w-7 h-7 rounded-md grid place-items-center transition ${
              tenant ? `${tenant.accent.bg} hover:brightness-95 ${tenant.accent.text}` : "hover:bg-slate-50 text-slate-500"
            }`}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                사이트 전환
              </div>
              <ul className="py-1">
                {TENANT_LIST.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => onPickTenant(t)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition text-left"
                    >
                      <span className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.gradient} text-white grid place-items-center text-base shrink-0`}>
                        {t.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-slate-900">{t.label}</div>
                        <div className="text-[11px] text-slate-500">{t.subtitle}</div>
                      </div>
                      {tenant?.id === t.id && (
                        <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
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
