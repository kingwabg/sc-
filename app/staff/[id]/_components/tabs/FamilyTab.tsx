"use client";

import type { StaffFamily } from "@/lib/features/staff/types";
import { Users, Plus, Home } from "lucide-react";

interface Props {
  family: StaffFamily[];
}

const CohabitBadge = ({ value }: { value?: "Y" | "N" }) => {
  if (!value) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
        value === "Y"
          ? "bg-blue-50 text-blue-600 border border-blue-200"
          : "bg-slate-50 text-slate-400 border border-slate-200"
      }`}
    >
      {value === "Y" ? (
        <>
          <Home className="w-2.5 h-2.5" /> 동거
        </>
      ) : (
        "별거"
      )}
    </span>
  );
};

export function FamilyTab({ family }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          가족 사항
        </h2>
        <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded px-2 py-1 transition-colors">
          <Plus className="w-3 h-3" />
          가족 추가
        </button>
      </div>

      {family.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          가족 정보가 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-medium text-slate-500">관계</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500">성명</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500">생년월일</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500">나이</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500">직업</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500">동거여부</th>
                <th className="text-left py-2 px-3 font-medium text-slate-500">비고</th>
              </tr>
            </thead>
            <tbody>
              {family.map((f) => {
                const age = f.birthDate
                  ? Math.floor(
                      (Date.now() - new Date(f.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
                    )
                  : f.age;
                return (
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-700 font-medium">{f.relation}</td>
                    <td className="py-2 px-3 text-slate-800">{f.name}</td>
                    <td className="py-2 px-3 text-slate-500">{f.birthDate ?? "—"}</td>
                    <td className="py-2 px-3 text-slate-500">{age ? `${age}세` : "—"}</td>
                    <td className="py-2 px-3 text-slate-500">{f.job ?? "—"}</td>
                    <td className="py-2 px-3">
                      <CohabitBadge value={f.cohabit} />
                    </td>
                    <td className="py-2 px-3 text-slate-400">{f.remarks ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
