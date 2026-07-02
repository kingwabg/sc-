"use client";

/**
 * AppointmentTab — 종사자 상세 > 발령 탭
 *
 * 컬럼: 발령일 / 발령종류 (입사/승진/전보/휴직/복직/퇴사) / 발령내용 / 발령권자 / 효력일
 * 호봉승급 발령 자동 표시 (1년 단위)
 */

import { useState, useMemo } from "react";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

type ApptKind = "입사" | "승진" | "전보" | "휴직" | "복직" | "퇴사" | "호봉승급";

type Appointment = {
  id: string;
  date: string;
  kind: ApptKind;
  content: string;
  authority: string;
  effectiveAt: string;
};

const KIND_TONE: Record<ApptKind, string> = {
  입사: "bg-brand-100 text-brand-700",
  승진: "bg-emerald-100 text-emerald-700",
  전보: "bg-sky-100 text-sky-700",
  휴직: "bg-amber-100 text-amber-700",
  복직: "bg-cyan-100 text-cyan-700",
  퇴사: "bg-slate-100 text-slate-700",
  호봉승급: "bg-violet-100 text-violet-700",
};

const KIND_OPTIONS = Object.keys(KIND_TONE) as ApptKind[];
const KIND_OPTIONS_MANUAL = KIND_OPTIONS.filter((k) => k !== "호봉승급");

// 입사일 기준 매년 1회 호봉승급 (자동 표시)
function generateHopBung(baseJoin: string, today: Date): Appointment[] {
  const startYear = parseInt(baseJoin.slice(0, 4), 10);
  const endYear = today.getFullYear();
  const list: Appointment[] = [];
  for (let y = startYear + 1, step = 1; y <= endYear; y++, step++) {
    list.push({
      id: `auto-hb-${y}`,
      date: `${y}-03-01`,
      kind: "호봉승급",
      content: `호봉 ${step}년차 승급 (정기)`,
      authority: "시군구청장",
      effectiveAt: `${y}-03-01`,
    });
  }
  return list;
}

const MANUAL_SEED: Appointment[] = [
  { id: "ap1", date: "2024-01-15", kind: "입사", content: "행정직 신규 채용 (5호봉)", authority: "센터장", effectiveAt: "2024-01-15" },
  { id: "ap2", date: "2024-09-01", kind: "승진", content: "행정 → 주임 행정 (6호봉)", authority: "센터장", effectiveAt: "2024-09-01" },
];

export function AppointmentTab({ joinDate }: { joinDate?: string }) {
  const base = joinDate ?? "2022-03-01";
  const today = new Date();
  const autoHops = useMemo(() => generateHopBung(base, today), [base]);
  const [manual, setManual] = useState<Appointment[]>(MANUAL_SEED);

  const all = useMemo(
    () => [...autoHops, ...manual].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
    [autoHops, manual],
  );

  function addManual() {
    const d = today.toISOString().slice(0, 10);
    setManual([...manual, { id: `ap-m-${Date.now()}`, date: d, kind: "전보", content: "", authority: "센터장", effectiveAt: d }]);
  }
  function update(id: string, patch: Partial<Appointment>) {
    setManual(manual.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function remove(id: string) {
    setManual(manual.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-800">발령 이력</h3>
          <span className="text-xs text-slate-500">총 {all.length}건 (자동 호봉승급 포함)</span>
        </div>
        <button
          onClick={addManual}
          className="h-8 px-3 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> 수동 추가
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["발령일", "발령종류", "발령내용", "발령권자", "효력일", ""].map((h) => (
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
              {all.map((a) => {
                const isAuto = a.id.startsWith("auto-");
                return (
                  <tr
                    key={a.id}
                    className={cn(
                      "hover:bg-slate-50",
                      isAuto && "bg-violet-50/40",
                    )}
                  >
                    <td className="px-3 py-2 text-xs text-slate-700">{a.date}</td>
                    <td className="px-3 py-2">
                      {isAuto ? (
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-[11px] font-medium",
                            KIND_TONE[a.kind],
                          )}
                        >
                          {a.kind} (자동)
                        </span>
                      ) : (
                        <select
                          value={a.kind}
                          onChange={(e) =>
                            update(a.id, { kind: e.target.value as ApptKind })
                          }
                          className={cn(
                            "h-7 px-2 rounded-md border text-[11px] font-medium",
                            KIND_TONE[a.kind],
                          )}
                        >
                          {KIND_OPTIONS.filter((k) => k !== "호봉승급").map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isAuto ? (
                        <span className="text-slate-700">{a.content}</span>
                      ) : (
                        <input
                          value={a.content}
                          onChange={(e) => update(a.id, { content: e.target.value })}
                          className="w-full px-2 h-8 border border-slate-200 rounded-md text-sm"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700">{a.authority}</td>
                    <td className="px-3 py-2 text-xs text-slate-700">{a.effectiveAt}</td>
                    <td className="px-3 py-2 text-right">
                      {isAuto ? (
                        <span className="text-[10px] text-slate-400">자동</span>
                      ) : (
                        <button
                          onClick={() => remove(a.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
