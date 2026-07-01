import { CheckSquare } from "lucide-react";
import { Card } from "./Card";
import { APPROVALS, STATUS_TONE } from "@/lib/features/approval";

export function ApprovalCard() {
  return (
    <Card title="결재 진행 현황" icon={<CheckSquare />} more="결재함 ›">
      <ul className="flex flex-col">
        {APPROVALS.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-2.5 py-2.5 text-[13px] border-b border-dashed border-slate-200 last:border-b-0"
          >
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                STATUS_TONE[a.status]
              }`}
            >
              {a.status}
            </span>
            <span className="flex-1 truncate text-slate-900">{a.title}</span>
            <span className="text-[11px] text-slate-400 shrink-0">{a.date}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
