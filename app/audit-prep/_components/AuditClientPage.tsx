"use client";

/**
 * app/audit-prep/_components/AuditClientPage.tsx
 * Client Component — 신호등 대시보드 + 모순 항목 리스트
 */

import { FileText, Download, ShieldCheck } from "lucide-react";
import type { AuditSummary, ConflictItem } from "@/lib/features/audit/types";
import { SIGNAL_EMOJI, SIGNAL_COLOR, CONFLICT_LABEL, CARD_DESCRIPTIONS } from "@/lib/features/audit/labels";

// ─── Props ───────────────────────────────────────────────────
interface Props {
  tenantName: string;
  summary: AuditSummary;
  conflicts: ConflictItem[];
  checkedRange: { from: string; to: string };
}

// ─── 신호등 카드 ─────────────────────────────────────────────
function SignalCard({
  emoji,
  colorClass,
  label,
  description,
  value,
  unit,
}: {
  emoji: string;
  colorClass: string;
  label: string;
  description: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${colorClass}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-xs opacity-70">{description}</p>
      <p className="text-2xl font-bold mt-auto">
        {value}{unit ?? ""}
      </p>
    </div>
  );
}

// ─── 모순 행 ─────────────────────────────────────────────────
function ConflictRow({ item }: { item: ConflictItem }) {
  const typeLabel = CONFLICT_LABEL[item.conflictType] ?? item.conflictType;
  const severityColor =
    item.severity === "HIGH"
      ? "bg-red-100 text-red-700"
      : item.severity === "MEDIUM"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
      <td className="px-3 py-2.5 font-medium text-slate-800">{item.childName}</td>
      <td className="px-3 py-2.5 text-slate-600 text-sm">{item.date}</td>
      <td className="px-3 py-2.5">
        {item.attendanceStatus ? (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              item.attendanceStatus === "결석"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {item.attendanceStatus}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">없음</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        {item.careLogExists ? (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            있음
          </span>
        ) : (
          <span className="text-slate-400 text-xs">없음</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${severityColor}`}>
          {typeLabel}
        </span>
      </td>
    </tr>
  );
}

// ─── 빈 상태 ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-5xl">🟢</span>
      <p className="text-lg font-semibold text-slate-700">모든 데이터 일치</p>
      <p className="text-sm text-slate-500">
        평가단 방문 준비 완료 — 출석, 일지, 서류가 모두 정상입니다.
      </p>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────
export function AuditClientPage({ tenantName, summary, conflicts, checkedRange }: Props) {
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── 헤더 ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h1 className="text-xl font-bold text-slate-800">평가 대비 모드</h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {tenantName} · {checkedRange.from} ~ {checkedRange.to} 기준
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            자동刷新 불가 · F5
          </span>
        </div>

        {/* ── 신호등 카드 4개 ─────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. 아동 상담 기록률 */}
          <SignalCard
            emoji={SIGNAL_EMOJI[summary.consultation.light]}
            colorClass={SIGNAL_COLOR[summary.consultation.light]}
            label="아동 상담 기록률"
            description={CARD_DESCRIPTIONS.consultation}
            value={summary.consultation.rate}
            unit="%"
          />

          {/* 2. 결재 서류 보관 */}
          <SignalCard
            emoji={SIGNAL_EMOJI[summary.document.light]}
            colorClass={SIGNAL_COLOR[summary.document.light]}
            label="결재 서류 보관"
            description={CARD_DESCRIPTIONS.document}
            value={summary.document.rate}
            unit="%"
          />

          {/* 3. 출석-일지 일관성 */}
          <SignalCard
            emoji={SIGNAL_EMOJI[summary.consistency.light]}
            colorClass={SIGNAL_COLOR[summary.consistency.light]}
            label="출석-일지 일관성"
            description={CARD_DESCRIPTIONS.consistency}
            value={`${summary.consistency.conflictCount}건`}
          />

          {/* 4. 후원금 매칭 */}
          <SignalCard
            emoji={SIGNAL_EMOJI[summary.sponsorship.light]}
            colorClass={SIGNAL_COLOR[summary.sponsorship.light]}
            label="후원금 매칭"
            description={CARD_DESCRIPTIONS.sponsorship}
            value={summary.sponsorship.rate}
            unit="%"
          />
        </div>

        {/* ── 모순 항목 리스트 ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">모순 항목 리스트</h2>
            {hasConflicts && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                {conflicts.length}건
              </span>
            )}
          </div>

          {hasConflicts ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500 font-medium">
                    <th className="px-3 py-2.5 rounded-tl">아동명</th>
                    <th className="px-3 py-2.5">날짜</th>
                    <th className="px-3 py-2.5">출석 상태</th>
                    <th className="px-3 py-2.5">돌봄기록</th>
                    <th className="px-3 py-2.5 rounded-tr">충돌 유형</th>
                  </tr>
                </thead>
                <tbody>
                  {conflicts.map((item, i) => (
                    <ConflictRow key={`${item.childId}-${item.date}-${i}`} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* ── 하단 액션 (P9) ───────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            평가 통보서 미리 작성
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            HWP 다운로드
          </button>
        </div>

      </div>
    </div>
  );
}
