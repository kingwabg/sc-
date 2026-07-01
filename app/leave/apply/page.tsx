/**
 * app/leave/apply/page.tsx — 휴가 신청 3-step wizard (Mavis 직접)
 *
 * Step 1: 휴가 종류 (12종) → Step 2: 날짜 + 사유 → Step 3: 미리보기 + 결재 상신
 */

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaveSidebar } from "@/components/layout/LeaveSidebar";
import { LeaveTypeGrid } from "./_components/LeaveTypeGrid";
import { LeaveDateRange } from "./_components/LeaveDateRange";
import { LeavePreview } from "./_components/LeavePreview";
import { StepIndicator } from "./_components/StepIndicator";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LeaveKind } from "@/lib/features/leave-mock";

const STEPS = ["종류", "날짜", "신청"] as const;

function calcDays(start: string, end: string, kind: LeaveKind): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  const diff = Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1;
  let workdays = 0;
  for (let d = 0; d < diff; d++) {
    const day = new Date(s);
    day.setDate(s.getDate() + d);
    const dow = day.getDay();
    if (dow !== 0 && dow !== 6) workdays++;
  }
  if (kind === "반차") return 0.5;
  return workdays;
}

export default function LeaveApplyPage() {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<LeaveKind | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const days = kind ? calcDays(startDate, endDate, kind) : 0;

  const canNext =
    (step === 0 && kind !== null) ||
    (step === 1 && startDate && endDate && days > 0) ||
    step === 2;

  const handleSubmit = async (): Promise<{ ok: boolean; id?: string; error?: string }> => {
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: kind,
          startDate,
          endDate: endDate || startDate,
          days,
          reason,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        return { ok: false, error: json.error ?? "API error" };
      }
      return { ok: true, id: json.id ?? json.data?.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network error" };
    }
  };

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <LeaveSidebar currentPath="/leave/apply" />

        <main>
          <header className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">휴가 신청</h1>
            <p className="text-xs text-slate-500 mt-1">
              {kind ? `${kind} 휴가 · ${days}일` : "휴가 종류를 선택하세요"}
            </p>
          </header>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <StepIndicator steps={STEPS as unknown as string[]} current={step} />

            <div className="min-h-[280px]">
              {step === 0 && (
                <LeaveTypeGrid
                  selected={kind}
                  onSelect={setKind}
                />
              )}
              {step === 1 && kind && (
                <LeaveDateRange
                  kind={kind}
                  startDate={startDate}
                  endDate={endDate}
                  reason={reason}
                  onChange={({ startDate: s, endDate: e, reason: r }) => {
                    setStartDate(s);
                    setEndDate(e);
                    setReason(r);
                  }}
                />
              )}
              {step === 2 && kind && (
                <LeavePreview
                  kind={kind}
                  startDate={startDate}
                  endDate={endDate || startDate}
                  days={days}
                  reason={reason}
                  onSubmit={handleSubmit}
                />
              )}
            </div>

            {step < 2 && (
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(2, s + 1))}
                  disabled={!canNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-200 disabled:text-slate-400 transition"
                >
                  다음
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppShell>
  );
}