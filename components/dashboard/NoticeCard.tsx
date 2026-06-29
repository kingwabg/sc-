import { Megaphone } from "lucide-react";
import { Card } from "./Card";
import { NOTICES, TAG_TONE } from "@/lib/data/notices";

export function NoticeCard() {
  return (
    <Card title="공지사항" icon={<Megaphone />} more="전체 ›">
      <ul className="flex flex-col">
        {NOTICES.map((n) => (
          <li
            key={n.id}
            className="flex items-center gap-2 py-2.5 border-b border-dashed border-slate-200 last:border-b-0"
          >
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold shrink-0 ${
                TAG_TONE[n.tag.tone ?? "default"]
              }`}
            >
              {n.tag.label}
            </span>
            <span className="flex-1 text-[13px] text-slate-900 truncate">{n.title}</span>
            <span className="text-[11px] text-slate-400 shrink-0">{n.date}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
