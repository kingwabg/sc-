type Stat = {
  label: string;
  value: number;
  unit: string;
  trend: string;
  trendTone?: "up" | "down" | "default";
};

const STATS: Stat[] = [
  { label: "처리 대기 결재", value: 3, unit: "건", trend: "어제 대비 +1", trendTone: "up" },
  { label: "안 읽은 메일", value: 12, unit: "통", trend: "어제 대비 -4", trendTone: "down" },
  { label: "오늘 일정", value: 5, unit: "건", trend: "다음 회의 11:00" },
  { label: "이번주 근태", value: 38, unit: "h", trend: "주 평균 +2h", trendTone: "up" },
];

export function StatStrip() {
  return (
    <section className="grid grid-cols-4 gap-3 mb-5">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="card-base card-hover p-4 transition-shadow hover:-translate-y-px"
        >
          <div className="text-xs text-slate-500 mb-2">{s.label}</div>
          <div className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
            {s.value}
            <span className="text-[13px] font-medium text-slate-500 ml-1">{s.unit}</span>
          </div>
          <div
            className={`text-[11px] mt-2 ${
              s.trendTone === "up"
                ? "text-emerald-600"
                : s.trendTone === "down"
                ? "text-brand-600"
                : "text-slate-500"
            }`}
          >
            {s.trend}
          </div>
        </div>
      ))}
    </section>
  );
}
