"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useSession, MOCK_USERS, type UserRole } from "@/lib/session";
import { useTenant } from "@/lib/tenant-context";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ROLE_INFO, ROUTE_TEST } from "./_data";

export default function RoleTestPage() {
  const router = useRouter();
  const { user, setMockRole } = useSession();
  const { ready, tenant } = useTenant();
  const [switched, setSwitched] = useState(false);

  if (!ready || !user) {
    return (
      <AppShell>
        <div className="text-center py-20 text-slate-500">세션 로딩 중...</div>
      </AppShell>
    );
  }

  const role: UserRole = user.role ?? "member";
  const info = ROLE_INFO[role];

  const handleSwitchRole = (newRole: UserRole) => {
    setMockRole(newRole);
    setSwitched(true);
    // 강제 리로드로 middleware 쿠키 갱신
    setTimeout(() => router.refresh(), 100);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-xl font-bold text-slate-800">역할 분기 테스트</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
            DEV ONLY
          </span>
        </div>

        {/* 현재 역할 카드 */}
        <div className={`rounded-2xl border p-6 ${info.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <info.icon className={`w-7 h-7 ${info.color}`} />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">현재 역할</p>
              <p className={`text-xl font-bold ${info.color}`}>{info.label}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">{info.description}</p>
          <div className="flex gap-4 text-xs">
            <span className={info.canAdmin ? "text-green-600 font-semibold" : "text-red-500"}>
              {info.canAdmin ? "✓" : "✗"} /admin 접근
            </span>
            <span className={info.canExec ? "text-green-600 font-semibold" : "text-red-500"}>
              {info.canExec ? "✓" : "✗"} /exec 접근
            </span>
          </div>
        </div>

        {/* 역할 전환 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-3">역할 전환 (로컬에만 적용)</h2>
          <p className="text-xs text-slate-500 mb-4">
            localStorage + <code className="bg-slate-100 px-1 rounded">officex-role</code> 쿠키 갱신.
            실제로는 Supabase Auth + DB role 필드 기반.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(ROLE_INFO) as UserRole[]).map((r) => {
              const ri = ROLE_INFO[r];
              const isActive = r === role;
              const Icon = ri.icon;
              return (
                <button
                  key={r}
                  onClick={() => handleSwitchRole(r)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                    isActive
                      ? `${ri.bg} border-current`
                      : "bg-slate-50 border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? ri.color : "text-slate-400"}`} />
                  <span className={`text-xs font-semibold ${isActive ? ri.color : "text-slate-500"}`}>
                    {ri.label.split(" ")[0]}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                      현재
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {switched && (
            <p className="text-xs text-green-600 mt-3 font-medium">
              ✓ 역할이 전환되었습니다. middleware 가드를 확인하려면 아래 링크를 클릭하세요.
            </p>
          )}
        </div>

        {/* 라우트 접근 시뮬레이션 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">라우트 접근 시뮬레이션</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              현재 역할로 각 경로에 접근 시 middleware 가드 결과 예측
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {ROUTE_TEST.map((route) => {
              const allowed = route.roles.includes(role);
              return (
                <div
                  key={route.href}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full grid place-items-center text-xs font-bold ${
                        allowed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                      }`}
                    >
                      {allowed ? "✓" : "✗"}
                    </span>
                    <span className="text-sm text-slate-700">{route.label}</span>
                    <span className="text-xs text-slate-400">
                      ({route.roles.map(r => ROLE_INFO[r as UserRole].label.split(" ")[0]).join(", ")})
                    </span>
                  </div>
                  <Link
                    href={route.href}
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 transition"
                  >
                    이동
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* 현재 사용자 정보 */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500 font-mono">
          <p>user.id: <span className="text-slate-700">{user.id}</span></p>
          <p>user.role: <span className="text-slate-700">{user.role}</span></p>
          <p>user.email: <span className="text-slate-700">{user.email}</span></p>
          <p>user.name: <span className="text-slate-700">{user.name}</span></p>
          <p>user.jobTitle: <span className="text-slate-700">{user.jobTitle ?? "-"}</span></p>
        </div>
      </div>
    </AppShell>
  );
}
