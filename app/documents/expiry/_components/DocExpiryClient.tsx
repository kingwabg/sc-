/**
 * app/documents/expiry/_components/DocExpiryClient.tsx
 *
 * Client Component — 만료 알림 리스트 + 신호등 카드
 * Server에서 받은 ExpiringDocsResult / DocExpiryLight 를 그대로 렌더.
 */

import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
} from "lucide-react";
import {
  DOC_CATEGORY_LABEL,
  DOC_CATEGORY_TONE,
  EXPIRY_STATUS_TONE,
  DOC_EXPIRY_PAGE_TITLE,
  DOC_EXPIRY_PAGE_DESC,
  DOC_EXPIRY_SIGNAL_LABEL,
  DOC_EXPIRY_SIGNAL_DESC,
  DOC_EXPIRY_EMPTY_TITLE,
  DOC_EXPIRY_EMPTY_DESC,
} from "@/lib/features/documents/labels";
import type {
  ExpiringDocsResult,
  DocExpiryLight,
  ExpiryWarning,
  ExpiryStatus,
} from "@/lib/features/documents/types";

// ─── Props ──────────────────────────────────────────────────
interface Props {
  result: ExpiringDocsResult;
  light: DocExpiryLight;
}

// ─── 신호등 매핑 ─────────────────────────────────────────────
const LIGHT_EMOJI = { GREEN: "🟢", YELLOW: "🟡", RED: "🔴" } as const;
const LIGHT_BG = {
  GREEN:  "bg-emerald-50 border-emerald-200 text-emerald-800",
  YELLOW: "bg-amber-50 border-amber-200 text-amber-800",
  RED:    "bg-red-50 border-red-200 text-red-800",
} as const;

// ─── 행 컴포넌트 ─────────────────────────────────────────────
function WarningRow({ item }: { item: ExpiryWarning }) {
  const tone = EXPIRY_STATUS_TONE[item.status];
  const cat = item.category;
  const catTone = cat ? DOC_CATEGORY_TONE[cat] : null;
  const catLabel = cat ? DOC_CATEGORY_LABEL[cat] : "기타";

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
      {/* 상태 배지 */}
      <td className="px-3 py-2.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${tone.bg} ${tone.text} ${tone.border}`}
        >
          {item.status === "EXPIRED" ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {item.statusLabel}
        </span>
      </td>
      {/* D-day */}
      <td className="px-3 py-2.5 font-mono text-sm font-semibold text-slate-700 whitespace-nowrap">
        {item.ddayLabel}
      </td>
      {/* 제목 */}
      <td className="px-3 py-2.5 font-medium text-slate-800">
        {item.title}
      </td>
      {/* 분류 */}
      <td className="px-3 py-2.5">
        {catTone ? (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${catTone.bg} ${catTone.text}`}>
            {catLabel}
          </span>
        ) : (
          <span className="text-xs text-slate-400">미분류</span>
        )}
      </td>
      {/* 만료일 */}
      <td className="px-3 py-2.5 text-sm text-slate-600 whitespace-nowrap">
        {item.expiryDate.toISOString().slice(0, 10)}
      </td>
      {/* 작성자 */}
      <td className="px-3 py-2.5 text-sm text-slate-600">
        {item.authorName}
      </td>
    </tr>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────
export function DocExpiryClient({ result, light }: Props) {
  // EXPIRED + EXPIRING_SOON 합쳐서 우선 표시, 시간 순
  const all = [...result.expired, ...result.expiringSoon];
  const hasAny = all.length > 0;

  return (
    <div className="max-w-5xl">
      {/* ── 뒤로가기 ── */}
      <Link
        href="/documents"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        문서 허브로 돌아가기
      </Link>

      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 m-0">
            <Calendar className="w-6 h-6 text-brand-500" />
            {DOC_EXPIRY_PAGE_TITLE}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {DOC_EXPIRY_PAGE_DESC} · 기준일 {result.computedAt}
          </p>
        </div>
      </div>

      {/* ── 신호등 카드 ── */}
      <div className={`rounded-2xl border p-5 mb-6 flex items-center gap-4 ${LIGHT_BG[light.light]}`}>
        <span className="text-4xl">{LIGHT_EMOJI[light.light]}</span>
        <div className="flex-1">
          <div className="text-base font-semibold m-0">
            {DOC_EXPIRY_SIGNAL_LABEL}
          </div>
          <p className="text-xs opacity-80 mt-0.5 m-0">
            {DOC_EXPIRY_SIGNAL_DESC}
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-2xl font-bold m-0">{light.expiringSoonCount}</div>
            <div className="text-[11px] opacity-70 mt-0.5">30일 내 만료</div>
          </div>
          <div>
            <div className="text-2xl font-bold m-0">{light.expiredCount}</div>
            <div className="text-[11px] opacity-70 mt-0.5">이미 만료</div>
          </div>
        </div>
      </div>

      {/* ── 만료 임박/만료 리스트 ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 m-0">
            만료 추적 대상 ({all.length}건)
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>만료 {result.expiredCount}건</span>
            <span>·</span>
            <span>임박 {result.expiringSoonCount}건</span>
            <span>·</span>
            <span>총 {result.total}건</span>
          </div>
        </header>

        {hasAny ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500 font-medium">
                  <th className="px-3 py-2.5 rounded-tl">상태</th>
                  <th className="px-3 py-2.5">D-day</th>
                  <th className="px-3 py-2.5">문서명</th>
                  <th className="px-3 py-2.5">분류</th>
                  <th className="px-3 py-2.5">만료일</th>
                  <th className="px-3 py-2.5 rounded-tr">작성자</th>
                </tr>
              </thead>
              <tbody>
                {all.map((item) => (
                  <WarningRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <p className="text-base font-semibold text-slate-700 m-0">
              {DOC_EXPIRY_EMPTY_TITLE}
            </p>
            <p className="text-sm text-slate-500 m-0">
              {DOC_EXPIRY_EMPTY_DESC}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}