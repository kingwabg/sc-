"use client";

import { cn } from "@/lib/utils";
import type { DailyStatsRow } from "../_lib/stats";

type Props = { rows: DailyStatsRow[] };

/**
 * 정부24 「지역아동센터 운영관리」 통계 양식 기반 테이블
 * 스크린샷의 컬럼 순서를 그대로 따라감:
 *   날짜 | 운영시간 | 담당자 | 정원 | 현재 | 조치 | 출석 | 미복귀 | 출석률(%) | 결석 | 공결
 *   종사자교육 | 종사자 | 프로그램 | 미복귀 | 종사자 | 교육 | 공휴 | 기타 | 상태 | 확인 메모
 */
export function StatsTable({ rows }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            {/* 1단 헤더 */}
            <tr className="bg-slate-100 text-slate-700">
              <th className="px-2 py-2 border border-slate-200 sticky left-0 bg-slate-100 z-10" rowSpan={2}>날짜</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>운영시간</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>담당자</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>정원</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>현재</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>조치</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>출석</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>미복귀</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>출석률(%)</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>결석</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>공결</th>
              <th className="px-2 py-2 border border-slate-200 bg-emerald-50/60" colSpan={3}>아동 관련</th>
              <th className="px-2 py-2 border border-slate-200 bg-indigo-50/60" colSpan={3}>종사자 관련</th>
              <th className="px-2 py-2 border border-slate-200 bg-amber-50/60" colSpan={2}>휴일/기타</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>상태</th>
              <th className="px-2 py-2 border border-slate-200" rowSpan={2}>확인 메모</th>
            </tr>
            {/* 2단 헤더 */}
            <tr className="bg-slate-50 text-slate-600">
              <th className="px-2 py-1.5 border border-slate-200 bg-emerald-50/40">종사자교육</th>
              <th className="px-2 py-1.5 border border-slate-200 bg-emerald-50/40">종사자</th>
              <th className="px-2 py-1.5 border border-slate-200 bg-emerald-50/40">프로그램</th>
              <th className="px-2 py-1.5 border border-slate-200 bg-indigo-50/40">미복귀</th>
              <th className="px-2 py-1.5 border border-slate-200 bg-indigo-50/40">종사자</th>
              <th className="px-2 py-1.5 border border-slate-200 bg-indigo-50/40">교육</th>
              <th className="px-2 py-1.5 border border-slate-200 bg-amber-50/40">공휴</th>
              <th className="px-2 py-1.5 border border-slate-200 bg-amber-50/40">기타</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} className="hover:bg-indigo-50/20 transition">
                <td className="px-2 py-1.5 border border-slate-200 text-slate-900 font-semibold sticky left-0 bg-white whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>{r.date}</span>
                    <span className={cn(
                      "text-[10px] font-bold w-4 h-4 rounded text-center leading-4",
                      r.dayOfWeek === "토" || r.dayOfWeek === "일" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600",
                    )}>
                      {r.dayOfWeek}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-600 whitespace-nowrap">{r.hours}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 whitespace-nowrap">{r.manager}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 tabular-nums">{r.capacity}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-900 font-semibold tabular-nums">{r.enrolled}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-500 tabular-nums">{r.measure}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-emerald-700 font-bold tabular-nums">{r.present}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-500 tabular-nums">{r.notReturned}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center tabular-nums">
                  <RateBar rate={r.attendanceRate} />
                </td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-red-600 font-semibold tabular-nums">{r.absent}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-amber-600 font-semibold tabular-nums">{r.excused}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 bg-emerald-50/20 tabular-nums">{r.staffEdu}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 bg-emerald-50/20 tabular-nums">{r.staff}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 bg-emerald-50/20 tabular-nums">{r.programs}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 bg-indigo-50/20 tabular-nums">{r.notReturned2}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 bg-indigo-50/20 tabular-nums">{r.staff2}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 bg-indigo-50/20 tabular-nums">{r.edu}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-700 bg-amber-50/20 tabular-nums">{r.holiday}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center text-slate-500 bg-amber-50/20 tabular-nums">{r.etc ?? "-"}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-center">
                  <span className={cn(
                    "inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap",
                    r.status === "ok" && "bg-emerald-100 text-emerald-700",
                    r.status === "warn" && "bg-amber-100 text-amber-700",
                    r.status === "none" && "bg-slate-100 text-slate-500",
                  )}>
                    {r.status === "ok" ? "정상" : r.status === "warn" ? "주의" : "-"}
                  </span>
                </td>
                <td className="px-2 py-1.5 border border-slate-200 text-slate-600 whitespace-nowrap">{r.memo}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={20} className="text-center py-12 text-slate-400 text-sm">해당 기간 통계가 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>총 {rows.length}일</span>
        <span className="text-slate-400">좌우 스크롤 가능 · 출석률 컬럼은 시각화 막대 표시</span>
      </div>
    </div>
  );
}

function RateBar({ rate }: { rate: number }) {
  const color =
    rate >= 90 ? "bg-emerald-500" : rate >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-1.5 min-w-[70px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all", color)} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-[11px] font-bold text-slate-700 w-8 text-right tabular-nums">{rate}%</span>
    </div>
  );
}