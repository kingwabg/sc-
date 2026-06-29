"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { TENANT_LIST, type Tenant, type TenantId } from "@/lib/tenants";
import { Building2, ChevronRight, Users, GraduationCap } from "lucide-react";

export default function TenantSelectPage() {
  const router = useRouter();
  const { tenant, setTenant, ready } = useTenant();
  const [selected, setSelected] = useState<TenantId | null>(null);

  // If already picked a tenant, jump to portal
  useEffect(() => {
    if (ready && tenant) router.replace("/portal");
  }, [ready, tenant, router]);

  function onPick(t: Tenant) {
    setSelected(t.id);
    setTenant(t.id);
    router.push("/portal");
  }

  const facilities = TENANT_LIST.filter((t) => t.type === "facility");
  const academies = TENANT_LIST.filter((t) => t.type === "academy");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-md shadow-brand-600/30">
            <Building2 className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">Office</div>
            <div className="text-xs text-slate-500">돌봄·교육 시설 통합 운영 플랫폼</div>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 m-0">
            어떤 사이트로 들어갈까요?
          </h1>
          <p className="mt-2 text-base text-slate-500 m-0">
            사업장을 선택하면 그에 맞는 대시보드·모듈·KPI가 활성화됩니다.
          </p>
        </div>

        {/* Facility pair */}
        <Group
          icon={<Users className="w-4 h-4" />}
          label="시설 (돌봄)"
          tenants={facilities}
          selected={selected}
          onPick={onPick}
        />

        {/* Academy pair */}
        <Group
          icon={<GraduationCap className="w-4 h-4" />}
          label="학원 (교육)"
          tenants={academies}
          selected={selected}
          onPick={onPick}
        />

        <p className="text-xs text-slate-400 text-center mt-10">
          헤더의 사이트 메뉴에서 다른 사이트로 전환할 수 있어요.
        </p>
      </div>
    </main>
  );
}

function Group({
  icon,
  label,
  tenants,
  selected,
  onPick,
}: {
  icon: React.ReactNode;
  label: string;
  tenants: Tenant[];
  selected: TenantId | null;
  onPick: (t: Tenant) => void;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
        <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 grid place-items-center text-slate-500">
          {icon}
        </span>
        {label}
        <span className="ml-1 text-xs text-slate-400">({tenants.length})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenants.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t)}
              className={[
                "group relative text-left rounded-2xl border bg-white p-5 transition shadow-card",
                "hover:shadow-card-hover hover:-translate-y-0.5",
                isSelected ? "border-brand-500 ring-2 ring-brand-200" : "border-slate-200",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${t.gradient} text-white grid place-items-center text-2xl shadow-md`}
                >
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{t.label}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${t.accent.bg} ${t.accent.text} font-semibold`}>
                      {t.type === "facility" ? "시설" : "학원"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.subtitle}</div>
                  <div className="mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{t.usersLabel}</span>
                    {" · "}
                    <span className="font-semibold text-slate-700">{t.staffLabel}</span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 mt-1 transition ${
                    isSelected ? "text-brand-600 translate-x-0.5" : "text-slate-300 group-hover:text-slate-500"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}