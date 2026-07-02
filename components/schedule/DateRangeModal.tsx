"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRangeValue = {
  from: string;
  to: string;
};

type Preset = {
  label: string;
  getRange: (today: Date) => DateRangeValue;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfQuarter(date: Date, quarter: number) {
  return new Date(date.getFullYear(), quarter * 3, 1);
}

function endOfQuarter(date: Date, quarter: number) {
  return new Date(date.getFullYear(), quarter * 3 + 3, 0);
}

function getMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      key: toDateKey(date),
      inMonth: date.getMonth() === month,
    };
  });
}

function normalizeRange(from: string, to: string): DateRangeValue {
  return from <= to ? { from, to } : { from: to, to: from };
}

function rangeLabel(range: DateRangeValue) {
  return `${range.from}  ~  ${range.to}`;
}

const PRESETS: Preset[] = [
  { label: "오늘", getRange: (today) => ({ from: toDateKey(today), to: toDateKey(today) }) },
  { label: "전일", getRange: (today) => ({ from: toDateKey(addDays(today, -1)), to: toDateKey(addDays(today, -1)) }) },
  { label: "주간", getRange: (today) => ({ from: toDateKey(startOfWeek(today)), to: toDateKey(endOfWeek(today)) }) },
  {
    label: "전주",
    getRange: (today) => ({
      from: toDateKey(addDays(startOfWeek(today), -7)),
      to: toDateKey(addDays(endOfWeek(today), -7)),
    }),
  },
  { label: "당월", getRange: (today) => ({ from: toDateKey(startOfMonth(today)), to: toDateKey(endOfMonth(today)) }) },
  {
    label: "전월",
    getRange: (today) => {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return { from: toDateKey(startOfMonth(prev)), to: toDateKey(endOfMonth(prev)) };
    },
  },
  { label: "올해", getRange: (today) => ({ from: `${today.getFullYear()}-01-01`, to: `${today.getFullYear()}-12-31` }) },
  { label: "상반기", getRange: (today) => ({ from: `${today.getFullYear()}-01-01`, to: `${today.getFullYear()}-06-30` }) },
  { label: "하반기", getRange: (today) => ({ from: `${today.getFullYear()}-07-01`, to: `${today.getFullYear()}-12-31` }) },
  { label: "1/4분기", getRange: (today) => ({ from: toDateKey(startOfQuarter(today, 0)), to: toDateKey(endOfQuarter(today, 0)) }) },
  { label: "2/4분기", getRange: (today) => ({ from: toDateKey(startOfQuarter(today, 1)), to: toDateKey(endOfQuarter(today, 1)) }) },
  { label: "3/4분기", getRange: (today) => ({ from: toDateKey(startOfQuarter(today, 2)), to: toDateKey(endOfQuarter(today, 2)) }) },
  { label: "4/4분기", getRange: (today) => ({ from: toDateKey(startOfQuarter(today, 3)), to: toDateKey(endOfQuarter(today, 3)) }) },
  { label: "오늘까지", getRange: (today) => ({ from: `${today.getFullYear()}-01-01`, to: toDateKey(today) }) },
];

export function DateRangeModal({
  open,
  value,
  title = "일자조회",
  onClose,
  onApply,
}: {
  open: boolean;
  value: DateRangeValue;
  title?: string;
  onClose: () => void;
  onApply: (value: DateRangeValue) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [draft, setDraft] = useState<DateRangeValue>(() => normalizeRange(value.from, value.to));
  const [cursor, setCursor] = useState(() => {
    const base = parseDateKey(value.from || toDateKey(today));
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  if (!open) return null;

  const rightCursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);

  function selectDate(key: string) {
    if (!draft.from || (draft.from && draft.to && draft.from !== draft.to)) {
      setDraft({ from: key, to: key });
      return;
    }
    setDraft(normalizeRange(draft.from, key));
  }

  function applyPreset(preset: Preset) {
    const presetRange = preset.getRange(today);
    const next = normalizeRange(presetRange.from, presetRange.to);
    setDraft(next);
    setCursor(startOfMonth(parseDateKey(next.from)));
  }

  function applyMonth(month: number) {
    const from = new Date(cursor.getFullYear(), month, 1);
    const next = { from: toDateKey(startOfMonth(from)), to: toDateKey(endOfMonth(from)) };
    setDraft(next);
    setCursor(startOfMonth(from));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <section className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 px-8 dark:border-slate-700">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="overflow-y-auto px-8 py-6">
          <div className="mb-6 rounded-md border-2 border-slate-200 bg-white px-6 py-5 dark:border-slate-700 dark:bg-slate-950/30">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xl font-bold text-slate-600">
              <span>기준연도</span>
              <div className="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
                <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear() - 1, cursor.getMonth(), 1))} className="grid h-11 w-11 place-items-center border-r border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="grid h-11 w-24 place-items-center text-slate-900">{cursor.getFullYear()}</div>
                <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear() + 1, cursor.getMonth(), 1))} className="grid h-11 w-11 place-items-center border-l border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <span className="text-slate-500">{rangeLabel(draft)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="h-10 rounded border border-slate-300 bg-white text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-blue-950/40"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3 md:grid-cols-12">
            {Array.from({ length: 12 }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyMonth(index)}
                className="h-10 rounded border border-slate-300 bg-white text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-blue-950/40"
              >
                {index + 1}월
              </button>
            ))}
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-2">
            <MonthCalendar
              cursor={cursor}
              draft={draft}
              onSelect={selectDate}
              onPrev={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            />
            <MonthCalendar
              cursor={rightCursor}
              draft={draft}
              onSelect={selectDate}
              onNext={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            />
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-8 py-5 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="inline-flex h-11 items-center gap-2 rounded bg-blue-500 px-4 text-base font-black text-white transition hover:bg-blue-600"
          >
            <Check className="h-5 w-5" />
            적용
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-base font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
            취소
          </button>
        </footer>
      </section>
    </div>
  );
}

function MonthCalendar({
  cursor,
  draft,
  onSelect,
  onPrev,
  onNext,
}: {
  cursor: Date;
  draft: DateRangeValue;
  onSelect: (key: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const cells = getMonthCells(cursor.getFullYear(), cursor.getMonth());
  const todayKey = toDateKey(new Date());

  return (
    <div className="border-l border-slate-200 dark:border-slate-700">
      <div className="flex h-14 items-center justify-between bg-slate-100 px-4 dark:bg-slate-800">
        <button type="button" onClick={onPrev} className={cn("text-slate-400 hover:text-slate-700", !onPrev && "invisible")}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button type="button" className="inline-flex items-center gap-1 text-xl font-black text-slate-800">
          {cursor.getMonth() + 1}월 {cursor.getFullYear()}
        </button>
        <button type="button" onClick={onNext} className={cn("text-slate-400 hover:text-slate-700", !onNext && "invisible")}>
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center dark:border-slate-700 dark:bg-slate-800">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-3 text-base font-black text-slate-700">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const selected = cell.key === draft.from || cell.key === draft.to;
          const inRange = draft.from <= cell.key && cell.key <= draft.to;
          const today = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelect(cell.key)}
              className={cn(
                "grid h-12 place-items-center text-lg font-semibold transition",
                cell.inMonth ? "text-slate-800 dark:text-slate-100" : "text-slate-300 dark:text-slate-600",
                inRange && "bg-blue-100 dark:bg-blue-950/55",
                selected && "bg-blue-500 text-white dark:bg-blue-500 dark:text-white",
                today && !selected && "font-black text-blue-600",
              )}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => onSelect(todayKey)}
          className="rounded border border-slate-300 bg-white px-4 py-2 text-base font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          오늘
        </button>
      </div>
    </div>
  );
}

export function formatDateRangeLabel(value: DateRangeValue) {
  if (value.from === value.to) return value.from;
  return `${value.from} ~ ${value.to}`;
}

export function todayRange(): DateRangeValue {
  const today = toDateKey(new Date());
  return { from: today, to: today };
}
