"use client";

/**
 * CareerMatrixTab — 종사자 상세 > 경력매트릭스 탭
 *
 * 시설유형별 경력 인정 매트릭스 (사회복지시설 100% / 유사시설 80% / 군복무 등)
 * 연도별 호봉 변동 추이 (div 막대)
 */

import { useMemo } from "react";
import { Briefcase, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type FacType = "social_welfare" | "similar" | "military" | "education" | "other";
type FacRow = {
  id: string;
  facilityName: string;
  type: FacType;
  fromDate: string;
  toDate: string | null;
  years: number;
  rate: number;
  recognizedYears: number;
};

const FACILITY_LABEL: Record<FacType, string> = {
  social_welfare: "사회복지시설", similar: "유사시설", military: "군복무",
  education: "교육기관", other: "기타",
};
const FACILITY_TONE: Record<FacType, string> = {
  social_welfare: "bg-brand-100 text-brand-700",
  similar: "bg-sky-100 text-sky-700",
  military: "bg-emerald-100 text-emerald-700",
  education: "bg-violet-100 text-violet-700",
  other: "bg-slate-100 text-slate-700",
};

const SEED: FacRow[] = [
  { id: "cm1", facilityName: "○○지역아동센터", type: "social_welfare", fromDate: "2022-03-01", toDate: null, years: 4, rate: 1.0, recognizedYears: 4 },
  { id: "cm2", facilityName: "△△어린이집", type: "similar", fromDate: "2020-06-01", toDate: "2022-02-28", years: 1.7, rate: 0.8, recognizedYears: 1.4 },
  { id: "cm3", facilityName: "국군○○부대", type: "military", fromDate: "2018-05-01", toDate: "2020-04-30", years: 2, rate: 1.0, recognizedYears: 2 },
  { id: "cm4", facilityName: "□□어린이집", type: "education", fromDate: "2016-03-01", toDate: "2018-04-30", years: 2.2, rate: 0.5, recognizedYears: 1.1 },
];

const HOPS: { year: number; hop: number; delta: number }[] = [
  { year: 2022, hop: 0, delta: 0 },
  { year: 2023, hop: 1, delta: 1 },
  { year: 2024, hop: 2, delta: 1 },
  { year: 2025, hop: 3, delta: 1 },
  { year: 2026, hop: 4, delta: 1 },
];

export function CareerMatrixTab() {
  const totals = useMemo(() => {
    let total = 0, recognized = 0;
    for (const r of SEED) {
      total += r.years;
      recognized += r.recognizedYears;
    }
    return { total: total.toFixed(1), recognized: recognized.toFixed(1) };
  }, []);

  const maxHop = Math.max(...HOPS.map((h) => h.hop), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-800">경력 매트릭스</h3>
        <span className="text-xs text-slate-500">시설유형별 인정 매트릭스</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-brand-50 rounded-lg p-3 text-brand-700">
          <div className="text-[11px]">총 경력 (년)</div>
          <div className="text-2xl font-bold">{totals.total}년</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-emerald-700">
          <div className="text-[11px]">인정 경력 (년)</div>
          <div className="text-2xl font-bold">{totals.recognized}년</div>
        </div>
        <div className="bg-violet-50 rounded-lg p-3 text-violet-700">
          <div className="text-[11px]">현재 호봉</div>
          <div className="text-2xl font-bold">
            {HOPS[HOPS.length - 1].hop}호봉
          </div>
        </div>
      </div>

      {/* ─── 시설유형별 경력 매트릭스 ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-semibold text-slate-800">시설유형별 인정율</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["시설명", "유형", "근무기간", "총 경력", "인정율", "인정년수"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEED.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-slate-700 font-medium">
                    {r.facilityName}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded text-[11px] font-medium",
                        FACILITY_TONE[r.type],
                      )}
                    >
                      {FACILITY_LABEL[r.type]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                    {r.fromDate} ~ {r.toDate ?? "재직중"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {r.years.toFixed(1)}년
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-2 bg-slate-100 rounded overflow-hidden min-w-[60px]">
                        <div
                          className="h-full bg-brand-500"
                          style={{ width: `${r.rate * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-600 tabular-nums">
                        {Math.round(r.rate * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-brand-700">
                    {r.recognizedYears.toFixed(1)}년
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 연도별 호봉 추이 (막대) ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-3">연도별 호봉 변동 추이</h4>
        <div className="flex items-end gap-3 h-32">
          {HOPS.map((h) => {
            const height = (h.hop / maxHop) * 100;
            return (
              <div key={h.year} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-slate-500 tabular-nums">
                  {h.hop}호봉
                </div>
                <div
                  className={cn(
                    "w-full rounded-t min-h-[4px]",
                    h.delta > 0 ? "bg-brand-500" : "bg-slate-300",
                  )}
                  style={{ height: `${height}%` }}
                />
                <div className="text-[10px] text-slate-500">{h.year}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          자동 갱신 기준: <span className="font-medium">매년 3월 1일</span> 호봉 +1 (입사일 기준)
        </div>
      </div>
    </div>
  );
}
