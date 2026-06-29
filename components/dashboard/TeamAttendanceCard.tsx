import { Users } from "lucide-react";
import { Card } from "./Card";
import {
  ATTENDANCE_STATS,
  TEAM_MEMBERS,
  MEMBER_STATUS_TONE,
} from "@/lib/data/team";

export function TeamAttendanceCard() {
  return (
    <Card title="팀 근태 현황" icon={<Users />} more="상세 ›">
      <div className="flex items-center gap-4 py-1 mb-2 border-b border-dashed border-slate-200">
        <div className="w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 grid place-items-center shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-[22px] font-bold text-brand-700 leading-none">18</span>
            <span className="text-[11px] text-slate-500 mt-1">팀 인원</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {ATTENDANCE_STATS.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                <span>{s.label}</span>
                <span className="font-bold text-slate-900">{s.count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded overflow-hidden">
                <div
                  className={`h-full rounded ${s.color}`}
                  style={{ width: `${s.widthPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        {TEAM_MEMBERS.map((m) => (
          <div key={m.id} className="flex items-center gap-2 text-[12px]">
            <span
              className={`w-7 h-7 rounded-lg grid place-items-center font-semibold text-[12px] shrink-0 ${m.color}`}
            >
              {m.initial}
            </span>
            <span className="flex-1 text-slate-900 font-medium">{m.name}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                MEMBER_STATUS_TONE[m.status]
              }`}
            >
              {m.statusText}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
