"use client";

/**
 * BusinessTripTab — 종사자 상세 > 출장 탭
 *
 * 컬럼: 기간 / 출장지 / 목적 / 교통비 / 일비 / 식비 / 비고
 * 합계 표시 (총 출장 횟수 + 비용 합계)
 */

import { useState, useMemo } from "react";
import { Plus, Trash2, Plane } from "lucide-react";

type Trip = {
  id: string;
  fromDate: string;
  toDate: string;
  destination: string; // 출장지
  purpose: string;
  transport: number; // 교통비
  daily: number;     // 일비
  meal: number;      // 식비
  notes: string;
};

const SEED: Trip[] = [
  { id: "bt1", fromDate: "2025-05-12", toDate: "2025-05-13", destination: "서울 종로구 사회복지회관", purpose: "보육 연수교육", transport: 80000, daily: 50000, meal: 30000, notes: "1박 2일" },
  { id: "bt2", fromDate: "2025-03-04", toDate: "2025-03-04", destination: "시청 교육과", purpose: "안전교육 결과보고", transport: 25000, daily: 20000, meal: 15000, notes: "당일" },
  { id: "bt3", fromDate: "2024-11-18", toDate: "2024-11-19", destination: "부산 아동안전교육원", purpose: "아동 안전매뉴얼 워크숍", transport: 150000, daily: 60000, meal: 40000, notes: "1박 2일" },
];

const nf0 = (n: number) => n.toLocaleString("ko-KR");

export function BusinessTripTab() {
  const [rows, setRows] = useState<Trip[]>(SEED);

  function add() {
    const d = new Date().toISOString().slice(0, 10);
    setRows([...rows, { id: `bt${Date.now()}`, fromDate: d, toDate: d, destination: "", purpose: "", transport: 0, daily: 0, meal: 0, notes: "" }]);
  }

  function update(id: string, patch: Partial<Trip>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    setRows(rows.filter((r) => r.id !== id));
  }

  const totals = useMemo(() => {
    let transport = 0, daily = 0, meal = 0;
    for (const r of rows) {
      transport += r.transport;
      daily += r.daily;
      meal += r.meal;
    }
    return { transport, daily, meal, total: transport + daily + meal, count: rows.length };
  }, [rows]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-800">출장 내역</h3>
          <span className="text-xs text-slate-500">총 {totals.count}건</span>
        </div>
        <button
          onClick={add}
          className="h-8 px-3 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> 추가
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "교통비 합계", value: nf0(totals.transport), tone: "bg-brand-50 text-brand-700" },
          { label: "일비 합계", value: nf0(totals.daily), tone: "bg-slate-50 text-slate-700" },
          { label: "식비 합계", value: nf0(totals.meal), tone: "bg-slate-50 text-slate-700" },
          { label: "총 출장비", value: `${nf0(totals.total)}원`, tone: "bg-emerald-50 text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-3 ${s.tone}`}>
            <div className="text-[11px]">{s.label}</div>
            <div className="text-base font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["기간", "출장지", "목적", "교통비", "일비", "식비", "비고", ""].map((h) => (
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
                    <div className="flex flex-col gap-1">
                      <input
                        type="date"
                        value={r.fromDate}
                        onChange={(e) => update(r.id, { fromDate: e.target.value })}
                        className="w-36 px-2 h-7 border border-slate-200 rounded-md text-xs"
                      />
                      <input
                        type="date"
                        value={r.toDate}
                        onChange={(e) => update(r.id, { toDate: e.target.value })}
                        className="w-36 px-2 h-7 border border-slate-200 rounded-md text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.destination}
                      onChange={(e) => update(r.id, { destination: e.target.value })}
                      className="w-44 px-2 h-8 border border-slate-200 rounded-md text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.purpose}
                      onChange={(e) => update(r.id, { purpose: e.target.value })}
                      className="w-40 px-2 h-8 border border-slate-200 rounded-md text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={r.transport}
                      onChange={(e) => update(r.id, { transport: Number(e.target.value) || 0 })}
                      className="w-24 px-2 h-8 border border-slate-200 rounded-md text-sm text-right"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={r.daily}
                      onChange={(e) => update(r.id, { daily: Number(e.target.value) || 0 })}
                      className="w-20 px-2 h-8 border border-slate-200 rounded-md text-sm text-right"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={r.meal}
                      onChange={(e) => update(r.id, { meal: Number(e.target.value) || 0 })}
                      className="w-20 px-2 h-8 border border-slate-200 rounded-md text-sm text-right"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.notes}
                      onChange={(e) => update(r.id, { notes: e.target.value })}
                      className="w-32 px-2 h-8 border border-slate-200 rounded-md text-sm"
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
                  <td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-400">
                    출장 내역이 없습니다.
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
