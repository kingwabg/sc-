import { Clock } from "lucide-react";
import type { Staff } from "@/lib/staff";

type Props = {
  staff: Staff;
  todayStr: string;
  positionLabel: string;
};

export function MyAttendanceHeader({ staff, todayStr, positionLabel }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">나의 근태</h1>
      </div>
      <p className="text-sm text-slate-500 m-0">
        {positionLabel} {staff.name}님 · {todayStr}
      </p>
    </div>
  );
}
