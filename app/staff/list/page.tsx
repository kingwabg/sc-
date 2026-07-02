"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_STAFF_PROFILES,
  type StaffProfile,
} from "@/lib/features/staff";
import { maskName, formatPhone, calcYearsOfService } from "@/lib/features/staff/utils";
import { Search, Shield, Eye, EyeOff } from "lucide-react";

type WorkStatus = "재직" | "휴직" | "퇴사";

const STATUS_COLORS: Record<string, string> = {
  "재직": "bg-green-50 text-green-700 border-green-200",
  "휴직": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "퇴사": "bg-slate-100 text-slate-500 border-slate-200",
};

interface Filter {
  query: string;
  dept: string;
  status: WorkStatus | "all";
}

const EMPTY_FILTER: Filter = { query: "", dept: "", status: "all" };

export default function StaffListPage() {
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
  const [masking, setMasking] = useState(true);

  const filtered = useMemo(() => {
    return MOCK_STAFF_PROFILES.filter((p) => {
      const q = filter.query.toLowerCase();
      if (q && !p.basic.serialNo.toLowerCase().includes(q) &&
          !p.basic.nameKr.toLowerCase().includes(q) &&
          !p.basic.department.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q)) return false;
      if (filter.dept && p.basic.department !== filter.dept) return false;
      if (filter.status !== "all" && p.basic.workStatus !== filter.status) return false;
      return true;
    });
  }, [filter]);

  const departments = useMemo(() => {
    const set = new Set(MOCK_STAFF_PROFILES.map((p) => p.basic.department));
    return Array.from(set).sort();
  }, []);

  const displayName = (p: StaffProfile) =>
    masking ? maskName(p.basic.nameKr) : p.basic.nameKr;

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        {/* ── 헤더 ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-800">직원 목록</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                총 {filtered.length}명 / 전체 {MOCK_STAFF_PROFILES.length}명
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-colors">
                + 직원 등록
              </button>
            </div>
          </div>
        </div>

        {/* ── 검색/필터 바 ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* 키워드 검색 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="직원명 / 직원번호 / 부서 검색"
                value={filter.query}
                onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
              />
            </div>

            {/* 부서 필터 */}
            <select
              value={filter.dept}
              onChange={(e) => setFilter((f) => ({ ...f, dept: e.target.value }))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">전체 부서</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* 근무상태 필터 */}
            <select
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as Filter["status"] }))}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">전체 상태</option>
              <option value="재직">재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴사">퇴사</option>
            </select>

            {/* 초기화 */}
            {(filter.query || filter.dept || filter.status !== "all") && (
              <button
                onClick={() => setFilter(EMPTY_FILTER)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                초기화
              </button>
            )}

            {/* 개인정보 마스킹 토글 */}
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={masking}
                onChange={(e) => setMasking(e.target.checked)}
                className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-200"
              />
              <Shield className="w-3 h-3" />
              개인정보 마스킹
            </label>
          </div>
        </div>

        {/* ── 테이블 ── */}
        <div className="px-6 py-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">직렬번호</th>
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">직원명</th>
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">부서</th>
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">직위</th>
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">호봉</th>
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">근무상태</th>
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">입사일</th>
                    <th className="text-left py-2.5 px-4 font-medium text-slate-500">연락처</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        검색 결과가 없습니다
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, i) => {
                      const yos = calcYearsOfService(p.basic.joinDate);
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => window.location.href = `/staff/${p.id}`}
                        >
                          <td className="py-2.5 px-4 text-slate-500">{p.basic.serialNo}</td>
                          <td className="py-2.5 px-4">
                            <span className="font-medium text-slate-800">{displayName(p)}</span>
                            {p.basic.nameCn && (
                              <span className="ml-1 text-slate-400">{p.basic.nameCn}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">{p.basic.department}</td>
                          <td className="py-2.5 px-4 text-slate-600">{p.basic.position}</td>
                          <td className="py-2.5 px-4 text-slate-600">{p.basic.salaryStep}호봉</td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium ${STATUS_COLORS[p.basic.workStatus] ?? "bg-slate-50 text-slate-500"}`}>
                              {p.basic.workStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">
                            {p.basic.joinDate}
                            <span className="ml-1 text-slate-400">({yos.years}년)</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">
                            {masking ? "010-****-****" : p.basic.mobile ? formatPhone(p.basic.mobile) : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
