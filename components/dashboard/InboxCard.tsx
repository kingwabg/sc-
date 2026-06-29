"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Card } from "./Card";
import { MAIL } from "@/lib/data/portal-mail";

const TAG_TONE = {
  blue: "bg-blue-50 text-blue-800 border-blue-200",
  red: "bg-red-50 text-red-700 border-red-200",
  default: "bg-slate-50 text-slate-600 border-slate-200",
} as const;

export function InboxCard() {
  const [items, setItems] = useState(MAIL);

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
    );
  }

  return (
    <Card title="받은 메일함" icon={<Mail />} more="전체보기 ›">
      <ul className="flex flex-col">
        {items.map((m) => (
          <li
            key={m.id}
            onClick={() => markRead(m.id)}
            className={`flex items-start gap-2.5 px-1 py-3 rounded-lg cursor-pointer hover:bg-slate-50 transition ${
              m.unread ? "" : "opacity-90"
            } border-t border-dashed border-slate-200 first:border-t-0`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                m.unread ? "bg-brand-600" : "bg-transparent"
              }`}
            />
            <span
              className={`w-7 h-7 rounded-lg grid place-items-center font-semibold text-[12px] shrink-0 ${m.fromColor}`}
            >
              {m.fromInitial}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span
                  className={`text-[13px] truncate ${
                    m.unread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                  }`}
                >
                  {m.title}
                </span>
                <span className="text-[11px] text-slate-400 shrink-0">{m.time}</span>
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5 truncate">{m.preview}</div>
            </div>
            {m.tag && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold shrink-0 self-center ${
                  TAG_TONE[m.tagTone ?? "default"]
                }`}
              >
                {m.tag}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
