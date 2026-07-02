"use client";

/**
 * RewardTab — 종사자 상세 > 상벌 탭
 *
 * 컬럼: 구분 (상/벌) / 일자 / 내용 / 발령권자 / 비고
 * 상 = 포상/표창 (emerald), 벌 = 징계/견책 (rose) 색상 구분
 */

import { useState } from "react";
import { Plus, Trash2, Award, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RewardKind = "상" | "벌";

type RewardRecord = {
  id: string;
  kind: RewardKind;
  date: string;
  title: string;
  authority: string;
  notes: string;
};

const SEED: RewardRecord[] = [
  {
    id: "rw1",
    kind: "상",
    date: "2024-12-30",
    title: "우수 종사자 표창 (10년 근속)",
    authority: "시군구청장",
    notes: "2024년 결산포상",
  },
  {
    id: "rw2",
    kind: "상",
    date: "2023-07-15",
    title: "아동 안전교육 유공 표창",
    authority: "센터장",
    notes: "내부 표창",
  },
  {
    id: "rw3",
    kind: "벌",
    date: "2022-04-08",
    title: "근태경고 (지각 3회)",
    authority: "센터장",
    notes: "기존 경고 누락",
  },
];

const KIND_TONE: Record<RewardKind, string> = {
  상: "bg-emerald-100 text-emerald-700 border-emerald-200",
  벌: "bg-rose-100 text-rose-700 border-rose-200",
};

export function RewardTab() {
  const [rows, setRows] = useState<RewardRecord[]>(SEED);

  function add() {
    setRows([
      ...rows,
      {
        id: `rw${Date.now()}`,
        kind: "상",
        date: new Date().toISOString().slice(0, 10),
        title: "",
        authority: "센터장",
        notes: "",
      },
    ]);
  }

  function update(id: string, patch: Partial<RewardRecord>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    setRows(rows.filter((r) => r.id !== id));
  }

  const rewardCount = rows.filter((r) => r.kind === "상").length;
  const punishCount = rows.filter((r) => r.kind === "벌").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
            <Award className="w-4 h-4 text-emerald-600" /> 상 {rewardCount}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600" /> 벌 {punishCount}
          </span>
        </div>
        <button
          onClick={add}
          className="h-8 px-3 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> 추가
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["구분", "일자", "내용", "발령권자", "비고", ""].map((h) => (
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
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <select
                      value={r.kind}
                      onChange={(e) => update(r.id, { kind: e.target.value as RewardKind })}
                      className={cn(
                        "h-8 px-2 rounded-md border text-xs font-semibold",
                        KIND_TONE[r.kind],
                      )}
                    >
                      <option value="상">상</option>
                      <option value="벌">벌</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={r.date}
                      onChange={(e) => update(r.id, { date: e.target.value })}
                      className="w-36 px-2 h-8 border border-slate-200 rounded-md text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.title}
                      onChange={(e) => update(r.id, { title: e.target.value })}
                      placeholder="표창/징계 사유"
                      className="w-full px-2 h-8 border border-slate-200 rounded-md text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.authority}
                      onChange={(e) => update(r.id, { authority: e.target.value })}
                      className="w-28 px-2 h-8 border border-slate-200 rounded-md text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.notes}
                      onChange={(e) => update(r.id, { notes: e.target.value })}
                      className="w-40 px-2 h-8 border border-slate-200 rounded-md text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">
                    상/벌 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
