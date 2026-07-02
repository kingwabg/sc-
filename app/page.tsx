"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "@/lib/session";
import { useTenant } from "@/lib/tenant-context";
import { TENANT_LIST, type Tenant, type TenantId, type TenantType } from "@/lib/tenants";
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { TENANT_VISUAL } from "@/lib/features/tenants";

const TYPE_META: Record<
  TenantType,
  {
    label: string;
    eyebrow: string;
    icon: ReactNode;
    description: string;
  }
> = {
  facility: {
    label: "돌봄 시설",
    eyebrow: "Facility operations",
    icon: <Users className="h-4 w-4" />,
    description: "출결, 돌봄 기록, 보호자 소통과 운영 점검을 한 흐름으로 연결합니다.",
  },
  academy: {
    label: "교육 기관",
    eyebrow: "Academy operations",
    icon: <GraduationCap className="h-4 w-4" />,
    description: "수강생, 강사, 강의 일정과 자격 과정을 빠르게 확인합니다.",
  },
};

const KPI_ICON = {
  users: Users,
  calendar: CalendarDays,
  doc: LayoutDashboard,
  check: CheckCircle2,
};


export default function TenantSelectPage() {
  const router = useRouter();
  const { tenant, setTenant, ready } = useTenant();
  const { user } = useSession();
  const [showLoading, setShowLoading] = useState(true);
  const [selected, setSelected] = useState<TenantId | null>(null);
  const [preview, setPreview] = useState<TenantId>(TENANT_LIST[0].id);
  const activeTenant = useMemo(
    () => TENANT_LIST.find((item) => item.id === (selected ?? preview)) ?? TENANT_LIST[0],
    [preview, selected],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || showLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (tenant) router.replace("/portal");
  }, [ready, user, tenant, showLoading, router]);

  function onPick(t: Tenant) {
    setSelected(t.id);
    setTenant(t.id);
    router.push("/portal");
  }

  const facilities = TENANT_LIST.filter((t) => t.type === "facility");
  const academies = TENANT_LIST.filter((t) => t.type === "academy");

  if (showLoading || !ready || !user) {
    return <StartupLoadingPage />;
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                <Building2 className="h-5 w-5" strokeWidth={2.3} />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight">Office</div>
                <div className="text-xs font-semibold text-slate-500">care & education ops</div>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              통합 운영 콘솔
            </div>
          </header>

          <div className="grid flex-1 content-center gap-8 py-10 lg:py-12">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                사업장에 맞춰 메뉴와 지표가 바뀝니다
              </div>
              <h1 className="m-0 text-[2.45rem] font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-[4rem]">
                오늘 운영할
                <br />
                사이트를 선택하세요.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
                시설과 학원 유형에 맞춰 대시보드, 결재, 출결, 문서 모듈이 바로 준비됩니다.
              </p>
            </div>

            <div className="space-y-6">
              <TenantGroup label="시설" tenants={facilities} selected={selected} onPick={onPick} onPreview={setPreview} />
              <TenantGroup label="학원" tenants={academies} selected={selected} onPick={onPick} onPreview={setPreview} />
            </div>
          </div>
        </section>

        <aside className="border-t border-slate-200 bg-white px-5 py-6 shadow-[0_-12px_40px_rgba(15,23,42,0.06)] sm:px-8 lg:min-h-screen lg:border-l lg:border-t-0 lg:px-7 lg:py-8 lg:shadow-[-18px_0_60px_rgba(15,23,42,0.06)]">
          <PreviewPanel tenant={activeTenant} />
        </aside>
      </div>
    </main>
  );
}

function StartupLoadingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-950">
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.14),transparent_62%)]" />
        <section className="relative flex w-full max-w-sm flex-col items-center text-center">
          <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-white shadow-xl shadow-slate-950/10 ring-1 ring-slate-200">
            <div className="absolute inset-0 rounded-3xl border border-blue-100" />
            <Building2 className="h-9 w-9 text-blue-600" strokeWidth={2.3} />
          </div>
          <div className="mt-7">
            <p className="m-0 text-sm font-black text-blue-600">Office</p>
            <h1 className="m-0 mt-2 text-2xl font-black text-slate-950">
              운영 환경을 준비하고 있어요
            </h1>
            <p className="m-0 mt-3 text-sm font-semibold leading-6 text-slate-500">
              사업장 설정과 대시보드 모듈을 불러오는 중입니다.
            </p>
          </div>
          <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-[loading-bar_1.2s_ease-in-out_infinite] rounded-full bg-blue-600" />
          </div>
        </section>
      </div>
    </main>
  );
}

function TenantGroup({
  label,
  tenants,
  selected,
  onPick,
  onPreview,
}: {
  label: string;
  tenants: Tenant[];
  selected: TenantId | null;
  onPick: (t: Tenant) => void;
  onPreview: (id: TenantId) => void;
}) {
  const type = tenants[0]?.type ?? "facility";
  const meta = TYPE_META[type];

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
            {meta.icon}
          </div>
          <div>
            <p className="m-0 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{meta.eyebrow}</p>
            <h2 className="m-0 text-base font-black text-slate-900">
              {label} <span className="font-bold text-slate-400">{tenants.length}</span>
            </h2>
          </div>
        </div>
        <p className="m-0 hidden max-w-sm text-right text-xs font-semibold leading-5 text-slate-500 md:block">
          {meta.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {tenants.map((tenant) => (
          <TenantCard
            key={tenant.id}
            tenant={tenant}
            selected={selected === tenant.id}
            onClick={() => onPick(tenant)}
            onPreview={() => onPreview(tenant.id)}
          />
        ))}
      </div>
    </section>
  );
}

function TenantCard({
  tenant,
  selected,
  onClick,
  onPreview,
}: {
  tenant: Tenant;
  selected: boolean;
  onClick: () => void;
  onPreview: () => void;
}) {
  const Icon = TENANT_VISUAL[tenant.id].icon;

  return (
    <button
      type="button"
      onMouseEnter={onPreview}
      onFocus={onPreview}
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/10",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
        selected ? "border-blue-500 ring-4 ring-blue-100" : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex gap-4">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1 shadow-sm ${TENANT_VISUAL[tenant.id].iconClassName}`}
        >
          <Icon className="h-7 w-7" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 truncate text-base font-black text-slate-950">{tenant.label}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${tenant.accent.bg} ${tenant.accent.text}`}>
                  {TYPE_META[tenant.type].label}
                </span>
              </div>
              <p className="m-0 mt-1 text-xs font-semibold text-slate-500">{tenant.subtitle}</p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <InfoPill label="대상" value={tenant.usersLabel} />
            <InfoPill label="팀" value={tenant.staffLabel} />
          </div>
        </div>
      </div>
    </button>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-black text-slate-400">{label}</div>
      <div className="mt-0.5 truncate text-xs font-black text-slate-800">{value}</div>
    </div>
  );
}

function PreviewPanel({ tenant }: { tenant: Tenant }) {
  const PanelIcon = TENANT_VISUAL[tenant.id].panelIcon;

  return (
    <div className="flex h-full flex-col">
      <div>
        <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Preview</p>
        <h2 className="m-0 mt-2 text-2xl font-black tracking-tight text-slate-950">{tenant.label}</h2>
        <p className="m-0 mt-2 text-sm font-semibold leading-6 text-slate-500">{tenant.greeting.morning}</p>
      </div>

      <div className={`mt-6 rounded-3xl bg-gradient-to-br ${tenant.gradient} p-5 text-white shadow-2xl shadow-slate-950/15`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-white/70">Today</p>
            <div className={`mt-4 grid h-16 w-16 place-items-center rounded-3xl ring-1 ${TENANT_VISUAL[tenant.id].surfaceClassName}`}>
              <PanelIcon className="h-8 w-8" strokeWidth={2.1} />
            </div>
            <p className="m-0 mt-4 text-xl font-black">{tenant.shortLabel}</p>
          </div>
          <div className="rounded-2xl bg-white/16 px-3 py-2 text-right backdrop-blur">
            <div className="text-2xl font-black">4</div>
            <div className="text-[11px] font-bold text-white/75">활성 모듈</div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-2">
          {tenant.kpis.slice(0, 4).map((kpi) => {
            const Icon = KPI_ICON[kpi.icon];
            return (
              <div key={kpi.title} className="rounded-2xl bg-white/14 p-3 backdrop-blur">
                <Icon className="h-4 w-4 text-white/85" />
                <div className="mt-2 text-xs font-black leading-4 text-white">{kpi.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <PreviewRow icon={<Activity className="h-4 w-4" />} label="운영 상태" value="정상" tone="text-emerald-700" />
        <PreviewRow icon={<LayoutDashboard className="h-4 w-4" />} label="시작 화면" value="맞춤 대시보드" />
        <PreviewRow icon={<ShieldCheck className="h-4 w-4" />} label="권한 범위" value={`${tenant.usersLabel} · ${tenant.staffLabel}`} />
      </div>

      <div className="mt-auto hidden pt-8 text-xs font-semibold leading-5 text-slate-400 lg:block">
        선택 후에도 상단 사업장 메뉴에서 다른 사이트로 전환할 수 있습니다.
      </div>
    </div>
  );
}

function PreviewRow({
  icon,
  label,
  value,
  tone = "text-slate-900",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-black text-slate-400">{label}</div>
        <div className={`mt-0.5 truncate text-sm font-black ${tone}`}>{value}</div>
      </div>
    </div>
  );
}
