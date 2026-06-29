"use client";

import { cn } from "@/lib/utils";
import type { CareLog } from "@/lib/features/children/types";
import { careLogCategoryTone } from "@/lib/features/children/utils";

const MOODS = [
  { v: "좋음" as const, emoji: "😊", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { v: "보통" as const, emoji: "😐", tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { v: "나쁨" as const, emoji: "😟", tone: "bg-red-100 text-red-700 border-red-200" },
];

type Props = { log: CareLog };

export function CareLogRow({ log }: Props) {
  const tone = careLogCategoryTone(log.category);
  const moodMeta = MOODS.find((m) => m.v === log.mood);

  return (
    <li className="ml-6 relative">
      <span className={cn("absolute -left-[31px] top-1.5 w-4 h-4 rounded-full ring-4 ring-white", tone.bg)} />
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className={cn("text-[11px] px-1.5 py-0.5 rounded font-semibold", tone.bg, tone.text)}>
          {log.category}
        </span>
        <span className="text-[11px] text-slate-500">{log.date}</span>
        {moodMeta && (
          <span className={cn("inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded font-medium border", moodMeta.tone)}>
            {moodMeta.emoji}
            {log.mood}
          </span>
        )}
      </div>
      <div className="text-sm font-semibold text-slate-900">{log.title}</div>
      <div className="text-sm text-slate-600 mt-0.5 leading-relaxed">{log.content}</div>
      <div className="text-[11px] text-slate-400 mt-1">작성: {log.authorName}</div>
    </li>
  );
}
