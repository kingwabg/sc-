"use client";

/**
 * ForeignLanguageTab — 종사자 상세 > 외국어 탭
 *
 * 컬럼: 언어 / 시험명 / 등급·점수 / 취득일 / 유효기간 / 사용가능수준
 * 추가/삭제 행 동작 (mock).
 */

import { useState } from "react";
import { Plus, Trash2, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ForeignLanguage = {
  id: string;
  language: string; // 영어, 일본어, 중국어...
  examName: string; // TOEIC, JLPT, HSK...
  grade: string;    // 900점, N1, 6급
  acquiredAt: string; // YYYY-MM-DD
  expiryAt: string | null; // null = 무기한
  level: string; // 상/중/하 / Native/Advanced...
};

const SEED: ForeignLanguage[] = [
  { id: "fl1", language: "영어", examName: "TOEIC", grade: "880점", acquiredAt: "2024-04-20", expiryAt: "2026-04-19", level: "업무가능" },
  { id: "fl2", language: "일본어", examName: "JLPT", grade: "N2", acquiredAt: "2023-09-10", expiryAt: null, level: "일상회화" },
  { id: "fl3", language: "중국어", examName: "HSK", grade: "4급", acquiredAt: "2022-06-15", expiryAt: null, level: "기초회화" },
];

function expiryTone(expiry: string | null): { label: string; tone: string } {
  if (!expiry) return { label: "무기한", tone: "bg-slate-100 text-slate-600" };
  const days = Math.ceil(
    (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return { label: "만료", tone: "bg-rose-100 text-rose-700" };
  if (days < 180) return { label: `${days}일 남음`, tone: "bg-amber-100 text-amber-700" };
  return { label: `${days}일 남음`, tone: "bg-emerald-100 text-emerald-700" };
}

export function ForeignLanguageTab() {
  const [rows, setRows] = useState<ForeignLanguage[]>(SEED);

  function add() {
    setRows([...rows, { id: `fl${Date.now()}`, language: "", examName: "", grade: "", acquiredAt: new Date().toISOString().slice(0, 10), expiryAt: null, level: "" }]);
  }

  function update(id: string, patch: Partial<ForeignLanguage>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-800">외국어 자격</h3>
          <span className="text-xs text-slate-500">총 {rows.length}건</span>
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
                {["언어", "시험명", "등급·점수", "취득일", "유효기간", "사용가능수준", ""].map((h) => (
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
              {rows.map((r) => {
                const exp = expiryTone(r.expiryAt);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <input
                        value={r.language}
                        onChange={(e) => update(r.id, { language: e.target.value })}
                        className="w-24 px-2 h-8 border border-slate-200 rounded-md text-sm"
                        placeholder="영어"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={r.examName}
                        onChange={(e) => update(r.id, { examName: e.target.value })}
                        className="w-24 px-2 h-8 border border-slate-200 rounded-md text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={r.grade}
                        onChange={(e) => update(r.id, { grade: e.target.value })}
                        className="w-24 px-2 h-8 border border-slate-200 rounded-md text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={r.acquiredAt}
                        onChange={(e) => update(r.id, { acquiredAt: e.target.value })}
                        className="w-36 px-2 h-8 border border-slate-200 rounded-md text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {r.expiryAt ? (
                        <span className={cn("inline-block px-2 py-0.5 rounded text-xs", exp.tone)}>
                          {r.expiryAt} {exp.label}
                        </span>
                      ) : (
                        <span className={cn("inline-block px-2 py-0.5 rounded text-xs", exp.tone)}>
                          {exp.label}
                        </span>
                      )}
                      <button
                        onClick={() =>
                          update(r.id, {
                            expiryAt: r.expiryAt ? null : new Date().toISOString().slice(0, 10),
                          })
                        }
                        className="ml-2 text-[11px] text-slate-400 hover:text-slate-600 underline"
                      >
                        {r.expiryAt ? "무기한" : "기간설정"}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={r.level}
                        onChange={(e) => update(r.id, { level: e.target.value })}
                        className="w-24 px-2 h-8 border border-slate-200 rounded-md text-sm"
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
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-400">
                    등록된 외국어 자격이 없습니다. 추가 버튼을 눌러 입력하세요.
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
