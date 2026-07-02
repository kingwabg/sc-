"use client";

/**
 * _components/NewTenantForm.tsx — 신규 센터 폼 UI
 *
 * page.tsx 가 받는 state 를 props 로 받아 렌더링만 담당.
 * - 섹션: 사이트 정보 / 요금제·한도 / 활성 앱 / 관리자·메모
 * - plan 변경 시 memberLimit/storageGB 기본값 자동 세팅
 */

import { useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, Save, Sparkles, X } from "lucide-react";

export type NewTenantFormValues = {
  siteName: string;
  tenantCode: string;
  defaultDomain: string;
  customDomain: string;
  plan: "basic" | "pro" | "enterprise";
  memberLimit: number;
  storageGB: number;
  startDate: string;
  expireDate: string;
  enabledApps: string[];
  ownerEmail: string;
  notes: string;
};

const APPS = [
  { key: "dashboard",  label: "대시보드" },
  { key: "staff",      label: "직원" },
  { key: "children",   label: "아동" },
  { key: "attendance", label: "출석" },
  { key: "approval",   label: "전자결재" },
  { key: "donation",   label: "후원" },
  { key: "meeting",    label: "회의" },
  { key: "inspection", label: "점검" },
  { key: "leave",      label: "연차" },
  { key: "accounting", label: "회계" },
  { key: "document",   label: "문서함" },
  { key: "audit",      label: "평가" },
  { key: "calendar",   label: "일정" },
  { key: "todo",       label: "업무" },
];

const PLAN_DEFAULT_GB: Record<string, number> = { basic: 5, pro: 10, enterprise: 50 };
const PLAN_DEFAULT_MEMBERS: Record<string, number> = { basic: 20, pro: 50, enterprise: 100 };

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition";

export default function NewTenantForm({
  initial,
  submitting,
  error,
  onSubmit,
}: {
  initial: NewTenantFormValues;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: NewTenantFormValues) => void;
}) {
  const [values, setValues] = useState<NewTenantFormValues>(initial);
  const set = <K extends keyof NewTenantFormValues>(key: K, v: NewTenantFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const canSubmit = !!values.siteName.trim() && values.enabledApps.length > 0 && !submitting;

  /** plan 변경 시 기본값 자동 세팅 */
  const onPlanChange = (next: "basic" | "pro" | "enterprise") => {
    setValues((prev) => ({
      ...prev,
      plan: next,
      memberLimit: PLAN_DEFAULT_MEMBERS[next],
      storageGB: PLAN_DEFAULT_GB[next],
    }));
  };

  const toggleApp = (key: string) =>
    setValues((prev) => ({
      ...prev,
      enabledApps: prev.enabledApps.includes(key)
        ? prev.enabledApps.filter((k) => k !== key)
        : [...prev.enabledApps, key],
    }));

  return (
    <div className="space-y-5 max-w-4xl">
      <Link
        href="/console/tenants"
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 w-fit"
      >
        <ChevronLeft className="w-3 h-3" />
        센터 목록
      </Link>

      <header className="flex items-center gap-2">
        <Building2 className="w-6 h-6 text-indigo-500" />
        <h1 className="text-xl font-bold text-slate-900">신규 센터 생성</h1>
        <span className="text-[10px] text-slate-400 ml-1">SaaS 멀티테넌트 · super-admin</span>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit(values);
        }}
        className="space-y-5"
      >
        {/* 사이트 정보 */}
        <Section title="사이트 정보">
          <Field label="사이트명" required>
            <input
              value={values.siteName}
              onChange={(e) => set("siteName", e.target.value)}
              placeholder="예: 서창지역아동센터"
              required
              className={INPUT}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="사이트 아이디" hint="비워두면 자동 생성">
              <input
                value={values.tenantCode}
                onChange={(e) => set("tenantCode", e.target.value)}
                placeholder="예: sc-20260001"
                className={`${INPUT} font-mono`}
              />
            </Field>
            <Field label="기본 도메인" hint="비워두면 자동 생성">
              <input
                value={values.defaultDomain}
                onChange={(e) => set("defaultDomain", e.target.value)}
                placeholder="예: sc23.ourdomain.com"
                className={`${INPUT} font-mono`}
              />
            </Field>
          </div>
          <Field label="커스텀 도메인 (선택)">
            <input
              value={values.customDomain}
              onChange={(e) => set("customDomain", e.target.value)}
              placeholder="예: 55hsxpm6fe.co.co"
              className={`${INPUT} font-mono`}
            />
          </Field>
        </Section>

        {/* 요금제 / 한도 */}
        <Section title="요금제 및 한도">
          <Field label="요금제" required>
            <div className="flex gap-2">
              {(["basic", "pro", "enterprise"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPlanChange(p)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition ${
                    values.plan === p
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="회원 한도 (명)">
              <input
                type="number"
                min={1}
                value={values.memberLimit}
                onChange={(e) => set("memberLimit", Number(e.target.value))}
                className={INPUT}
              />
            </Field>
            <Field label="저장 용량 (GB)">
              <input
                type="number"
                min={1}
                value={values.storageGB}
                onChange={(e) => set("storageGB", Number(e.target.value))}
                className={INPUT}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="사용 시작일" required>
              <input
                type="date"
                value={values.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                required
                className={INPUT}
              />
            </Field>
            <Field label="만료일 (선택)">
              <input
                type="date"
                value={values.expireDate}
                onChange={(e) => set("expireDate", e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
        </Section>

        {/* 활성 앱 */}
        <Section title="활성 앱" hint={`${values.enabledApps.length}개 선택됨`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {APPS.map((a) => {
              const on = values.enabledApps.includes(a.key);
              return (
                <label
                  key={a.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${
                    on
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleApp(a.key)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  {a.label}
                </label>
              );
            })}
          </div>
        </Section>

        {/* 관리자 / 메모 */}
        <Section title="관리자 및 메모">
          <Field label="최고관리자 이메일">
            <input
              type="email"
              value={values.ownerEmail}
              onChange={(e) => set("ownerEmail", e.target.value)}
              placeholder="owner@example.com"
              className={INPUT}
            />
          </Field>
          <Field label="메모 (선택)">
            <textarea
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="내부 메모 (주소, 특이사항 …)"
              rows={3}
              className={INPUT}
            />
          </Field>
        </Section>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <Link
            href="/console/tenants"
            className="flex items-center gap-1 px-4 py-2 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            <X className="w-3.5 h-3.5" />
            취소
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium transition"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "생성 중…" : "센터 생성"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {title}
        </h2>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
