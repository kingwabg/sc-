"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  SETTING_GROUPS,
  getItemById,
  type SettingGroup,
  type SettingItem,
  type SettingSubItem,
} from "@/lib/settings";
import { getTenantSettings, saveTenantSettings, type TenantSettings } from "@/lib/store";
import {
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  Search,
  HelpCircle,
  Star,
  Clock,
  ChevronDown,
  ChevronRight,
  Check,
  Building2,
  Database,
  ShieldCheck,
  AppWindow,
  Link2,
  User,
  Bell,
  Palette,
  Info,
  ExternalLink,
  RefreshCw,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "내 정보": User,
  "즐겨찾기": Star,
  "최근 사용한 메뉴": Clock,
  "기본 관리": Building2,
  "데이터 관리": Database,
  "보안 관리": ShieldCheck,
  "App 관리": AppWindow,
  "시스템 연동": Link2,
};

export default function SettingsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [scope, setScope] = useState<"My" | "Management">("Management");
  const [activeGroupId, setActiveGroupId] = useState<string>("general");
  const [activeItemId, setActiveItemId] = useState<string>("service");
  const [activeSubId, setActiveSubId] = useState<string>("service-info");

  // URL hash 동기화 (선택 사항)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const [g, i, s] = hash.split("/");
      if (g) {
        setScope(SETTING_GROUPS.find((x) => x.id === g)?.scope ?? "Management");
        setActiveGroupId(g);
        if (i) setActiveItemId(i);
        if (s) setActiveSubId(s);
      }
    }
  }, []);

  function pickSub(group: SettingGroup, item: SettingItem, sub: SettingSubItem) {
    setScope(group.scope);
    setActiveGroupId(group.id);
    setActiveItemId(item.id);
    setActiveSubId(sub.id);
    window.location.hash = `${group.id}/${item.id}/${sub.id}`;
  }

  function pickItem(group: SettingGroup, item: SettingItem) {
    setScope(group.scope);
    setActiveGroupId(group.id);
    setActiveItemId(item.id);
    const firstSub = item.children?.[0]?.id ?? item.id;
    setActiveSubId(firstSub);
    window.location.hash = `${group.id}/${item.id}/${firstSub}`;
  }

  const activeGroup = SETTING_GROUPS.find((g) => g.id === activeGroupId);
  const activeItem = activeGroup?.items.find((i) => i.id === activeItemId);
  const activeSub = activeItem?.children?.find((c) => c.id === activeSubId);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-60px)] -m-8 -mt-6">
        {/* 통합설정 sidebar */}
        <aside
          className={cn(
            "border-r border-slate-200 bg-white flex flex-col transition-all duration-200",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <div className="h-12 px-3 flex items-center justify-between border-b border-slate-200 shrink-0">
            {!collapsed && (
              <h1 className="text-base font-bold text-slate-900">통합설정</h1>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 grid place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title={collapsed ? "사이드바 열기" : "사이드바 접기"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {!collapsed ? (
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              <NavSection label="전체 메뉴" items={[]} />
              <NavSection
                label="My"
                scope="My"
                scopeFilter={scope}
                onScope={setScope}
                items={SETTING_GROUPS.filter((g) => g.scope === "My" && g.id !== "recent")}
                onPickGroup={(g) => pickItem(g, g.items[0] ?? { id: "x", label: "" })}
              />
              <NavSection
                label="최근 사용한 메뉴"
                items={[]}
              />
              <NavSection
                label="즐겨찾기"
                badge="0"
                items={[]}
              />
              <NavSection
                label="Management"
                scope="Management"
                scopeFilter={scope}
                onScope={setScope}
                items={SETTING_GROUPS.filter((g) => g.scope === "Management")}
                activeId={activeGroupId}
                onPickGroup={(g) => {
                  setActiveGroupId(g.id);
                  const firstItem = g.items[0];
                  if (firstItem) {
                    setActiveItemId(firstItem.id);
                    const firstSub = firstItem.children?.[0]?.id ?? firstItem.id;
                    setActiveSubId(firstSub);
                    window.location.hash = `${g.id}/${firstItem.id}/${firstSub}`;
                  }
                }}
              />
            </nav>
          ) : (
            <nav className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-1">
              {SETTING_GROUPS.map((g) => {
                const Icon = ICON_MAP[g.label] ?? Building2;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      setScope(g.scope);
                      pickItem(g, g.items[0] ?? { id: "x", label: "" });
                    }}
                    title={g.label}
                    className={cn(
                      "w-10 h-10 rounded-lg grid place-items-center transition",
                      activeGroupId === g.id
                        ? "bg-brand-50 text-brand-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </nav>
          )}

          <div className="border-t border-slate-200 p-3">
            {!collapsed ? (
              <button className="w-full flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50">
                <HelpCircle className="w-4 h-4" />
                도움말
              </button>
            ) : (
              <button className="w-10 h-10 rounded-lg grid place-items-center text-slate-500 hover:bg-slate-50 mx-auto" title="도움말">
                <HelpCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </aside>

        {/* Middle sidebar */}
        {activeGroup && (
          <aside className="w-60 border-r border-slate-200 bg-slate-50/40 flex flex-col">
            <div className="h-12 px-5 flex items-center border-b border-slate-200 shrink-0">
              <h2 className="text-[15px] font-bold text-slate-900">{activeGroup.label}</h2>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              {activeGroup.items.length === 0 ? (
                <div className="text-center py-8 text-[12px] text-slate-400">
                  항목이 없습니다
                </div>
              ) : (
                activeGroup.items.map((item) => {
                  const isActiveItem = activeItemId === item.id;
                  return (
                    <div key={item.id} className="mb-1">
                      <button
                        onClick={() => pickItem(activeGroup, item)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 h-9 rounded-lg text-[13px] font-semibold transition",
                          isActiveItem
                            ? "bg-brand-50 text-brand-700"
                            : "text-slate-700 hover:bg-slate-100",
                        )}
                      >
                        <span>{item.label}</span>
                        {item.children && item.children.length > 0 && (
                          <ChevronDown
                            className={cn(
                              "w-3.5 h-3.5 transition",
                              isActiveItem ? "rotate-0" : "rotate-0 opacity-50",
                            )}
                          />
                        )}
                      </button>
                      {isActiveItem && item.children && (
                        <div className="ml-3 pl-3 border-l border-slate-200 mt-1 space-y-0.5">
                          {item.children.map((sub) => {
                            const isActive = activeSubId === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => pickSub(activeGroup, item, sub)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 h-8 rounded-md text-[12.5px] transition text-left",
                                  isActive
                                    ? "bg-brand-50/70 text-brand-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-100",
                                )}
                              >
                                <span className="flex-1 truncate">{sub.label}</span>
                                {isActive && <Check className="w-3 h-3 text-brand-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </nav>
          </aside>
        )}

        {/* Right content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          <ContentArea group={activeGroup} item={activeItem} sub={activeSub} />
        </main>
      </div>
    </AppShell>
  );
}

function NavSection({
  label,
  items,
  badge,
  scope,
  scopeFilter,
  onScope,
  activeId,
  onPickGroup,
}: {
  label: string;
  items: SettingGroup[];
  badge?: string;
  scope?: "My" | "Management";
  scopeFilter?: "My" | "Management";
  onScope?: (s: "My" | "Management") => void;
  activeId?: string;
  onPickGroup?: (g: SettingGroup) => void;
}) {
  const Icon = ICON_MAP[label];
  return (
    <div>
      <h3 className="px-3 mb-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
        {badge && (
          <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
            {badge}
          </span>
        )}
      </h3>
      {items.length === 0 && (
        <div className="px-3 text-[12px] text-slate-400 py-2">{scope ? "" : "비어 있음"}</div>
      )}
      <ul className="space-y-0.5">
        {items.map((g) => {
          const ItemIcon = ICON_MAP[g.label] ?? Building2;
          const isActive = activeId === g.id;
          return (
            <li key={g.id}>
              <button
                onClick={() => {
                  if (scope && onScope) onScope(scope);
                  onPickGroup?.(g);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] font-medium transition text-left",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                <ItemIcon className={cn("w-4 h-4", isActive ? "text-brand-600" : "text-slate-500")} />
                <span className="flex-1 truncate">{g.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContentArea({
  group,
  item,
  sub,
}: {
  group?: SettingGroup;
  item?: SettingItem;
  sub?: SettingSubItem;
}) {
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>(() =>
    typeof window !== "undefined" ? getTenantSettings() : {
      capacity: 50, businessName: "(주)오피스", representative: "김민수", businessRegNo: "000-00-00000",
    },
  );
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveTenantSettings(tenantSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCancel() {
    setTenantSettings(typeof window !== "undefined" ? getTenantSettings() : tenantSettings);
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-3">
        <span>{group?.label}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>{item?.label}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">{sub?.label}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-slate-900 m-0">{sub?.label ?? "설정"}</h1>
          {saved && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ✓ 저장됨
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 m-0">
          {sub?.description ?? `${group?.label ?? ""} > ${item?.label ?? ""} 항목의 상세 정보를 관리합니다.`}
        </p>
      </div>

      {/* Settings form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card">
        <FormForSub
          subId={sub?.id ?? ""}
          tenantSettings={tenantSettings}
          onChange={setTenantSettings}
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={handleCancel}
          className="h-10 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-[10px] hover:bg-slate-50"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="h-10 px-4 bg-brand-600 text-white text-sm font-semibold rounded-[10px] hover:bg-brand-700 shadow-sm"
        >
          저장
        </button>
      </div>
    </div>
  );
}

function FormForSub({
  subId,
  tenantSettings,
  onChange,
}: {
  subId: string;
  tenantSettings: TenantSettings;
  onChange: (s: TenantSettings) => void;
}) {
  // 서브별 다른 폼 (데모)
  if (subId === "service-info") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoCard label="사이트명" value="지역아동센터" />
          <InfoCard label="사이트 아이디" value="17000004442" />
          <InfoCard label="기본 도메인" value="sc23.office.local" />
          <InfoCard label="서비스 상태" value="사용중" tone="emerald" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-3 text-[13px] font-bold text-slate-900">서비스 사용 현황</div>
          <div className="space-y-3">
            <UsageBar label="사용기간" value="~2099.12.31" percent={72} />
            <UsageBar label="멤버" value="4명 사용중" percent={46} />
            <UsageBar label="용량" value="4.2GB 사용중" percent={52} />
          </div>
        </div>
      </div>
    );
  }

  if (subId === "business") {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-extrabold text-slate-900">사업자 정보</div>
              <p className="m-0 mt-1 text-[12px] leading-5 text-slate-500">
                고객포털의 회사법인정보가 반영됩니다. 동기화되는 사업자 정보는 고객포털에서 직접 수정할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              고객포털 바로가기
            </button>
          </div>
          <div className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-3 text-[12px] font-semibold text-slate-500 ring-1 ring-slate-200">
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            최근 동기화 일자
            <span className="font-bold text-slate-700">2026-06-26 11:06</span>
          </div>
        </div>

        <FormSection
          title="회사 정보"
          description="서비스 사용을 위해 꼭 입력해야 하는 필수 회사 정보입니다."
        >
          <FormRow label="법인 여부" required>
            <RadioGroup options={["법인", "개인"]} />
          </FormRow>
          <FormRow label="회사명" required>
            <input
              className={inputClass}
              placeholder="서창지역아동센터"
              value={tenantSettings.businessName}
              onChange={(e) => onChange({ ...tenantSettings, businessName: e.target.value })}
            />
          </FormRow>
          <FormRow label="대표자명" required>
            <input
              className={inputClass}
              placeholder="최문태"
              value={tenantSettings.representative}
              onChange={(e) => onChange({ ...tenantSettings, representative: e.target.value })}
            />
          </FormRow>
          <FormRow label="사업자등록번호" required>
            <SegmentedBusinessNumber
              value={tenantSettings.businessRegNo}
              onChange={(value) => onChange({ ...tenantSettings, businessRegNo: value })}
            />
          </FormRow>
          <FormRow label="법인등록번호" required>
            <div className="flex items-center gap-2">
              <input className={inputClass + " w-40"} placeholder="000000" />
              <span className="text-slate-400">-</span>
              <input className={inputClass + " w-40"} placeholder="0000000" />
            </div>
          </FormRow>
          <FormRow label="시설 정원" required>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={inputClass + " w-28"}
                placeholder="50"
                min={1}
                max={999}
                value={tenantSettings.capacity}
                onChange={(e) =>
                  onChange({ ...tenantSettings, capacity: parseInt(e.target.value, 10) || 0 })
                }
              />
              <span className="text-sm text-slate-500">명</span>
              <span className="text-xs text-slate-400">
                아동 출결대장의 정원으로 자동 반영됩니다.
              </span>
            </div>
          </FormRow>
        </FormSection>

        <FormSection
          title="상세 정보"
          description="각종 서식과 보고 문서에서 사용하는 대표자 상세 정보입니다."
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <RepresentativeFields title="대표자 1" />
            <RepresentativeFields title="대표자 2" />
          </div>
        </FormSection>
      </div>
    );
  }

  if (subId === "work-portal" || subId === "company-portal" || subId === "service-apps") {
    const isWorkPortal = subId === "work-portal";
    const isCompanyPortal = subId === "company-portal";
    return (
      <div className="space-y-4">
        <FormRow label="표시 이름">
          <input
            className={inputClass}
            defaultValue={isWorkPortal ? "업무 포털" : isCompanyPortal ? "전사 포털" : "서비스앱"}
          />
        </FormRow>
        <FormRow label="사용 여부">
          <RadioGroup options={["사용", "미사용"]} />
        </FormRow>
        <FormRow label="기본 진입 메뉴">
          <select className={inputClass}>
            {(isWorkPortal
              ? ["홈", "아동관리", "종사자관리", "결재", "보고"]
              : isCompanyPortal
                ? ["회계 대시보드", "수입 관리", "지출 관리", "인사관리"]
                : ["업무 포털", "전사 포털", "전자결재"]
            ).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </FormRow>
        <FormRow label="앱 설명">
          <textarea
            className={inputClass + " h-24 resize-none"}
            defaultValue={
              isWorkPortal
                ? "센터의 일상 업무, 돌봄 운영, 결재, 보고 기능을 제공합니다."
                : isCompanyPortal
                  ? "회계, 인사, 조직 설정 등 전사 관리 기능을 제공합니다."
                  : "센터에서 사용할 서비스 앱의 노출과 접근 권한을 관리합니다."
            }
          />
        </FormRow>
      </div>
    );
  }

  if (subId === "logo-theme") {
    return (
      <div className="space-y-4">
        <FormRow label="회사 로고">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-slate-100 border border-dashed border-slate-300 grid place-items-center text-slate-400">
              🏢
            </div>
            <button className="h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-sm">업로드</button>
          </div>
        </FormRow>
        <FormRow label="브랜드 컬러">
          <input type="color" defaultValue="#4f46e5" className="h-10 w-20 rounded" />
        </FormRow>
        <FormRow label="상단 브랜드명">
          <input className={inputClass} defaultValue="Office" />
        </FormRow>
        <FormRow label="테마 기본값">
          <RadioGroup options={["라이트", "다크", "시스템"]} />
        </FormRow>
      </div>
    );
  }

  if (subId === "electronic-alert") {
    return (
      <div className="space-y-4">
        <FormRow label="알림 채널">
          <RadioGroup options={["메일", "메신저", "브라우저"]} />
        </FormRow>
        <FormRow label="결재 알림">
          <RadioGroup options={["사용", "미사용"]} />
        </FormRow>
        <FormRow label="보고 알림">
          <RadioGroup options={["사용", "미사용"]} />
        </FormRow>
      </div>
    );
  }

  if (subId === "popup-notice") {
    return (
      <div className="space-y-4">
        <FormRow label="팝업 사용">
          <RadioGroup options={["사용", "미사용"]} />
        </FormRow>
        <FormRow label="공지 제목">
          <input className={inputClass} placeholder="공지 제목을 입력하세요" />
        </FormRow>
        <FormRow label="공지 내용">
          <textarea className={inputClass + " h-28 resize-none"} placeholder="팝업 공지 내용을 입력하세요" />
        </FormRow>
      </div>
    );
  }

  if (subId === "profile-org") {
    return (
      <div className="space-y-4">
        <FormRow label="프로필 표시 항목">
          <CheckList items={["이름", "직위", "부서", "연락처", "이메일"]} />
        </FormRow>
        <FormRow label="조직도 표시 항목">
          <CheckList items={["조직명", "직책", "근무상태", "내선번호"]} />
        </FormRow>
        <FormRow label="공개 범위">
          <RadioGroup options={["전체 공개", "관리자만", "비공개"]} />
        </FormRow>
      </div>
    );
  }

  // 기본 폼 (그 외)
  return (
    <div className="space-y-4">
      <FormRow label="설정 이름">
        <input className={inputClass} placeholder="설정 값" />
      </FormRow>
      <FormRow label="설명">
        <textarea
          className={inputClass + " h-24 resize-none"}
          placeholder="이 설정에 대한 설명을 입력하세요"
        />
      </FormRow>
      <FormRow label="활성화">
        <RadioGroup options={["활성", "비활성"]} />
      </FormRow>
    </div>
  );
}

function InfoCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "emerald";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[12px] font-semibold text-slate-400">{label}</div>
      <div className={cn("mt-2 text-lg font-extrabold", tone === "emerald" ? "text-emerald-600" : "text-slate-900")}>
        {value}
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="m-0 text-[15px] font-extrabold text-slate-900">{title}</h3>
        <p className="m-0 mt-1 text-[12px] leading-5 text-slate-500">{description}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-2">
        {children}
      </div>
    </section>
  );
}

function SegmentedBusinessNumber({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [first = "", second = "", third = ""] = value.split("-");

  function update(index: number, nextValue: string) {
    const parts = [first, second, third];
    parts[index] = nextValue.replace(/\D/g, "");
    onChange(parts.join("-"));
  }

  return (
    <div className="flex items-center gap-2">
      <input
        className={inputClass + " w-24"}
        inputMode="numeric"
        maxLength={3}
        value={first}
        onChange={(event) => update(0, event.target.value)}
      />
      <span className="text-slate-400">-</span>
      <input
        className={inputClass + " w-24"}
        inputMode="numeric"
        maxLength={2}
        value={second}
        onChange={(event) => update(1, event.target.value)}
      />
      <span className="text-slate-400">-</span>
      <input
        className={inputClass + " w-28"}
        inputMode="numeric"
        maxLength={5}
        value={third}
        onChange={(event) => update(2, event.target.value)}
      />
    </div>
  );
}

function RepresentativeFields({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="mb-3 text-[13px] font-extrabold text-slate-900">{title}</div>
      <div className="space-y-3">
        <div>
          <div className="mb-1 text-[12px] font-bold text-slate-600">내/외국인 구분</div>
          <RadioGroup options={["내국인", "외국인"]} />
        </div>
        <div>
          <div className="mb-1 text-[12px] font-bold text-slate-600">주민번호</div>
          <div className="flex items-center gap-2">
            <input className={inputClass + " w-28"} inputMode="numeric" maxLength={6} placeholder="000000" />
            <span className="text-slate-400">-</span>
            <div className="relative">
              <input className={inputClass + " w-32 pr-10"} inputMode="numeric" maxLength={7} placeholder="0000000" type="password" />
              <EyeOff className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-1 text-[12px] font-bold text-slate-600">직책</div>
          <input className={inputClass} placeholder="대표자 직책" defaultValue={title === "대표자 1" ? "센터장" : ""} />
        </div>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      {items.map((item) => (
        <label key={item} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-brand-600" />
          {item}
        </label>
      ))}
    </div>
  );
}

const inputClass =
  "h-10 px-3 bg-white border border-slate-200 rounded-[10px] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-slate-100 last:border-0">
      <div className="w-40 shrink-0 pt-2 text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function RadioGroup({ options }: { options: string[] }) {
  const groupId = useId();

  return (
    <div className="flex items-center gap-6 pt-2">
      {options.map((o, i) => (
        <label key={o} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`radio-${groupId}`}
            defaultChecked={i === 0}
            className="w-4 h-4 accent-brand-600"
          />
          <span className="text-[13px] text-slate-700">{o}</span>
        </label>
      ))}
    </div>
  );
}
