import { CalendarDays } from "lucide-react";
import { Card } from "./Card";
import { SCHEDULE } from "@/lib/data/schedule";

export function ScheduleCard() {
  return (
    <Card title="오늘의 일정" icon={<CalendarDays />} more="달력 ›">
      <ul className="flex flex-col gap-1">
        {SCHEDULE.map((s) => (
          <li
            key={s.id}
            className={`flex items-center gap-3 p-2 rounded-md ${
              s.isNow ? "" : ""
            }`}
          >
            <span className="text-[12px] font-semibold text-slate-500 w-[42px] shrink-0 tabular-nums">
              {s.time}
            </span>
            <span className={`w-[3px] h-8 rounded-sm shrink-0 ${s.color}`} />
            <div className="flex-1 min-w-0">
              <div className={`text-[13px] font-semibold ${s.isNow ? "text-red-500" : "text-slate-900"}`}>
                {s.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-px">{s.subtitle}</div>
            </div>
            {s.isNow && (
              <span className="ml-auto text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded tracking-wider">
                NOW
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
