"use client";

/**
 * app/audit-prep/_components/AuditClientPage.tsx
 * Client Component — 신호등 대시보드 + 모순 항목 + 평가 통보서 미리보기
 */

import { useState } from "react";
import { FileText, Download, ShieldCheck, ChevronDown, ChevronUp, Eye, EyeOff, X } from "lucide-react";
import type { AuditSummary, ConflictItem, AuditNotice, EvalItem } from "@/lib/features/audit/types";
import { SIGNAL_EMOJI, SIGNAL_COLOR, CONFLICT_LABEL, CARD_DESCRIPTIONS } from "@/lib/features/audit/labels";
import { downloadHtmlAsFile } from "@/lib/features/hwp-export/client";
import { readLS, writeLS } from "@/lib/store/_ls";

// ─── Props ───────────────────────────────────────────────────
interface Props {
  tenantName: string;
  summary: AuditSummary;
  conflicts: ConflictItem[];
  checkedRange: { from: string; to: string };
  notice: AuditNotice;
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

// ─── 평가 항목 체크 행 ────────────────────────────────────────
function EvalItemRow({ item }: { item: EvalItem }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-2.5">
        <span className="font-medium text-slate-700 text-sm">{item.label}</span>
        {item.note && (
          <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
        )}
      </td>
      <td className="px-3 py-2.5 text-sm text-slate-500 whitespace-nowrap">{item.threshold}</td>
      <td className="px-3 py-2.5 text-sm font-semibold text-slate-700 whitespace-nowrap">
        {item.current}{item.unit ?? ""}
      </td>
      <td className="px-3 py-2.5">
        {item.passed ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
            통과
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
            미통과
          </span>
        )}
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
export function AuditClientPage({ tenantName, summary, conflicts, checkedRange, notice }: Props) {
  const hasConflicts = conflicts.length > 0;
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const passCount = notice.evalItems.filter((e) => e.passed).length;

  const handleHtmlDownload = async () => {
    // 1회용 안내 팝업
    const dismissed = readLS<boolean>("ox:hwp-hint-dismissed", false);
    if (!dismissed) {
      setHintOpen(true);
      return;
    }

    // API에서 HTML fetch 후 다운로드
    const res = await fetch(`/api/audit-notice/${notice.id}/html`);
    if (!res.ok) return;
    const html = await res.text();
    downloadHtmlAsFile(`평가통보서_${notice.rangeFrom}_${notice.rangeTo}.html`, html);
  };

  const dismissHint = () => {
    writeLS("ox:hwp-hint-dismissed", true);
    setHintOpen(false);
  };

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

        {/* ── 평가 항목 체크리스트 ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-700">평가 항목별 점검</h2>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                {passCount}/{notice.evalItems.length} 항목 통과
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500 font-medium">
                  <th className="px-3 py-2.5 rounded-tl">평가 항목</th>
                  <th className="px-3 py-2.5">기준</th>
                  <th className="px-3 py-2.5">현재값</th>
                  <th className="px-3 py-2.5 rounded-tr">결과</th>
                </tr>
              </thead>
              <tbody>
                {notice.evalItems.map((item) => (
                  <EvalItemRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 평가 통보서 미리보기 ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-700">평가 통보서 미리보기</h2>
              <span className="text-xs text-slate-400">
                {notice.rangeFrom} ~ {notice.rangeTo}
              </span>
            </div>
            <button
              onClick={() => setNoticeOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              {noticeOpen ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> 접기
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> 미리보기
                </>
              )}
            </button>
          </div>

          {noticeOpen && (
            <div className="border-t border-slate-100">
              <div
                className="p-6 bg-slate-50"
                dangerouslySetInnerHTML={{ __html: notice.previewHtml }}
              />
            </div>
          )}
        </div>

        {/* ── 다운로드 버튼 ─────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          {/* HTML / HWP — Phase 1 */}
          <div className="relative inline-flex flex-col gap-1">
            <button
              onClick={handleHtmlDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              📥 한글(HWP)로 저장
            </button>
            <span className="text-xs text-slate-400 text-center">
              다운로드 후 한글에서 열어 .hwp 저장
            </span>
          </div>
          {/* HWP — P9에서 구현 */}
          <button
            disabled
            title="P9 작업에서 구현 예정"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            📥 HWP 다운로드
          </button>
          {/* PDF — P9-A에서 구현 */}
          <button
            disabled
            title="P9-A 작업에서 구현 예정"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            📥 PDF 다운로드
          </button>
        </div>

        {/* ── 첫 다운로드 안내 모달 ─────────────────────── */}
        {hintOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card max-w-sm w-full mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">한글(HWP)로 저장하는 방법</h3>
                <button
                  onClick={dismissHint}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm text-slate-600">
                  다운로드된 HTML 파일을{" "}
                  <strong className="text-slate-800">한글(HWP)</strong>에서 열어주세요.
                </p>
                <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
                  <p className="text-xs text-slate-500 font-medium">한글에서:</p>
                  <p className="text-xs text-slate-500">1. 파일 → 열기 → 다운로드한 HTML 파일 선택</p>
                  <p className="text-xs text-slate-500">2. 파일 → 다른 이름으로 저장</p>
                  <p className="text-xs text-slate-500">3. 파일 형식: <strong>HWP 문서(*.hwp)</strong> 선택</p>
                  <p className="text-xs text-slate-500">4. 저장</p>
                </div>
                <button
                  onClick={dismissHint}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  알겠습니다
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
