"use client";

import { useSession } from "@/lib/session";
import {
  Users,
  Baby,
  UserCog,
  HeartHandshake,
  FileText,
  ShieldCheck,
} from "lucide-react";

/* ─── 더미 통계 (실제 DB 연동 전까지 seed 기반 수치) ─── */
const STATS = [
  { label: "아동 수", value: 3, icon: Baby,       color: "text-blue-600",   bg: "bg-blue-50" },
  { label: "종사자 수", value: 5, icon: UserCog,   color: "text-violet-600", bg: "bg-violet-50" },
  { label: "자원봉사자", value: 4, icon: HeartHandshake, color: "text-green-600", bg: "bg-green-50" },
  { label: "조합원",   value: 3, icon: Users,      color: "text-amber-600",  bg: "bg-amber-50" },
  { label: "문서 수",  value: 6, icon: FileText,   color: "text-slate-600",  bg: "bg-slate-50" },
];

const MOCK_USERS = [
  { id: "u_1", name: "왕준하",  email: "center@example.com", role: "owner",  position: "센터장",    avatarColor: "#7c3aed" },
  { id: "u_2", name: "박은수",  email: "park@example.com",   role: "admin",  position: "생활복지사", avatarColor: "#ea580c" },
  { id: "u_3", name: "김선영",  email: "kim@example.com",   role: "admin",  position: "생활복지사", avatarColor: "#059669" },
  { id: "u_4", name: "이정훈",  email: "lee@example.com",   role: "member", position: "조리사",     avatarColor: "#d97706" },
];

const ROLE_LABEL: Record<string, string> = {
  owner:  "소유자",
  admin:  "관리자",
  member: "운영자",
};

const ROLE_Badge_COLOR: Record<string, string> = {
  owner:  "bg-violet-100 text-violet-700",
  admin:  "bg-blue-100 text-blue-700",
  member: "bg-slate-100 text-slate-600",
};

export function AdminClient() {
  const { user } = useSession();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {user?.name}님 ({user?.jobTitle}) — 사업장 관리 및 사용자 현황
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ShieldCheck className="w-4 h-4 text-violet-500" />
          <span>관리자 전용</span>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 flex flex-col items-center text-center gap-2"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} grid place-items-center`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs font-medium text-slate-500">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">사용자 목록</h2>
          <p className="text-xs text-slate-400 mt-0.5">사업장에 등록된 모든 사용자</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">이름</th>
                <th className="px-5 py-3">이메일</th>
                <th className="px-5 py-3">직책</th>
                <th className="px-5 py-3">권한</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-full grid place-items-center text-white text-xs font-bold shrink-0"
                        style={{ background: u.avatarColor }}
                      >
                        {u.name.slice(0, 1)}
                      </span>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3 text-slate-600">{u.position}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_Badge_COLOR[u.role]}`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
