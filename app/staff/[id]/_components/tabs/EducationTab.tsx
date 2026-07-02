"use client";

import type { StaffEducation } from "@/lib/features/staff/types";
import { GraduationCap, Plus } from "lucide-react";

interface Props {
  education: StaffEducation[];
}

const DegreeBadge = ({ degree }: { degree: StaffEducation["degree"] }) => {
  const map: Record<string, string> = {
    "고등학교": "bg-slate-100 text-slate-600",
    "전문대학": "bg-blue-100 text-blue-700",
    "대학교": "bg-indigo-100 text-indigo-700",
    "대학원": "bg-purple-100 text-purple-700",
    "석사": "bg-violet-100 text-violet-700",
    "박사": "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[degree] ?? ""}`}>
      {degree}
    </span>
  );
};

const GraduationBadge = ({ type }: { type?: StaffEducation["graduationType"] }) => {
  if (!type) return null;
  const map: Record<string, string> = {
    "졸업": "bg-green-50 text-green-600 border border-green-200",
    "중퇴": "bg-red-50 text-red-500 border border-red-200",
    "재학": "bg-blue-50 text-blue-500 border border-blue-200",
    "휴학": "bg-yellow-50 text-yellow-600 border border-yellow-200",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${map[type] ?? ""}`}>
      {type}
    </span>
  );
};

export function EducationTab({ education }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          학력 사항
        </h2>
        <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded px-2 py-1 transition-colors">
          <Plus className="w-3 h-3" />
          학력 추가
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          학력 정보가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div
              key={edu.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">#{i + 1}</span>
                    <DegreeBadge degree={edu.degree} />
                    <GraduationBadge type={edu.graduationType} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{edu.schoolName}</h3>
                  {edu.major && (
                    <p className="text-xs text-slate-500 mt-0.5">전공: {edu.major}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                {edu.enterDate && <span>입학: {edu.enterDate}</span>}
                {edu.graduateDate && <span>졸업: {edu.graduateDate}</span>}
                {edu.remarks && <span className="text-slate-400">({edu.remarks})</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
