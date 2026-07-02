"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  DateRangeModal,
  formatDateRangeLabel,
  todayRange,
  type DateRangeValue,
} from "@/components/schedule/DateRangeModal";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  type: "meeting" | "program" | "deadline" | "care";
};

const EVENTS: CalendarEvent[] = [
  { id: "e1", title: "클라이언트 미팅", date: "2026-07-02", time: "11:00", place: "서울 본사 5층", type: "meeting" },
  { id: "e2", title: "데일리 스크럼", date: "2026-07-02", time: "09:00", place: "온라인", type: "meeting" },
  { id: "e3", title: "디자인 리뷰", date: "2026-07-02", time: "14:30", place: "화상회의", type: "program" },
  { id: "e4", title: "주간회의", date: "2026-07-02", time: "16:00", place: "일원 회의실", type: "meeting" },
  { id: "e5", title: "보호자 알림 발송", date: "2026-07-06", time: "10:00", place: "운영팀", type: "care" },
  { id: "e6", title: "프로그램 일지 마감", date: "2026-07-10", time: "18:00", place: "문서함", type: "deadline" },
  { id: "e7", title: "월간 계획 점검", date: "2026-07-15", time: "13:00", place: "돌봄운영", type: "program" },
];

const TYPE_META: Record<CalendarEvent["type"], { label: string; className: string }> = {
  meeting: { label: "회의", className: "bg-blue-50 text-blue-700 ring-blue-100" },
  program: { label: "프로그램", className: "bg-violet-50 text-violet-700 ring-violet-100" },
  deadline: { label: "마감", className: "bg-rose-50 text-rose-700 ring-rose-100" },
  care: { label: "돌봄", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getCalendarCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: dateKey(date),
      inMonth: date.getMonth() === month,
    };
  });
}

export function CalendarPageClient() {
  const [cursor, setCursor] = useState(() => new Date(2026, 6, 1));
  const [range, setRange] = useState<DateRangeValue>(() => todayRange());
  const [dateModalOpen, setDateModalOpen] = useState(false);

  const cells = useMemo(
    () => getCalendarCells(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );
  const eventMap = useMemo(() => {
    return EVENTS.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      acc[event.date] ??= [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, []);
  const rangeEvents = EVENTS.filter((event) => range.from <= event.date && event.date <= range.to);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5 py-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                <CalendarDays className="h-3.5 w-3.5" />
                Schedule Calendar
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">일정 캘린더</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                기간 조회와 일정 등록에서 같은 날짜 선택 모달을 사용합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDateModalOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <Search className="h-4 w-4 text-slate-400" />
                {formatDateRangeLabel(range)}
              </button>
              <button
                type="button"
                onClick={() => setDateModalOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                일정 등록
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="min-w-[180px] text-center text-xl font-black text-slate-950">
                {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
              </div>
              <button
                type="button"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="text-sm font-bold text-slate-500">
              조회 기간 일정 <span className="text-slate-950">{rangeEvents.length}</span>건
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-3 py-3 text-center text-xs font-black text-slate-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((cell) => {
              const dayEvents = eventMap[cell.key] ?? [];
              const isToday = cell.key === dateKey(new Date());
              return (
                <div
                  key={cell.key}
                  className={cn(
                    "min-h-[132px] border-r border-t border-slate-100 p-3",
                    !cell.inMonth && "bg-slate-50/60 text-slate-300",
                    cell.inMonth && "bg-white",
                    isToday && "bg-blue-50/50",
                  )}
                >
                  <div className={cn("mb-2 text-sm font-black", cell.inMonth ? "text-slate-700" : "text-slate-300")}>
                    {cell.date.getDate()}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventPill key={event.id} event={event} />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[11px] font-bold text-slate-400">+{dayEvents.length - 3}개 더</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          {rangeEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-black ring-1", TYPE_META[event.type].className)}>
                    {TYPE_META[event.type].label}
                  </span>
                  <h3 className="mt-2 text-base font-black text-slate-950">{event.title}</h3>
                </div>
                <span className="text-xs font-black text-slate-400">{event.date}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.time}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.place}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />운영팀</span>
              </div>
            </article>
          ))}
        </section>
      </div>

      <DateRangeModal
        open={dateModalOpen}
        value={range}
        title="일자조회"
        onClose={() => setDateModalOpen(false)}
        onApply={(next) => {
          setRange(next);
          setCursor(new Date(Number(next.from.slice(0, 4)), Number(next.from.slice(5, 7)) - 1, 1));
          setDateModalOpen(false);
        }}
      />
    </AppShell>
  );
}

function EventPill({ event }: { event: CalendarEvent }) {
  return (
    <div className={cn("truncate rounded-md px-2 py-1 text-[11px] font-black ring-1", TYPE_META[event.type].className)}>
      {event.time} {event.title}
    </div>
  );
}
