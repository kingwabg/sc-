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

export type DateRangeModalSize = "sm" | "md" | "lg";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const SIZE_OPTIONS: Array<{ value: DateRangeModalSize; label: string }> = [
  { value: "sm", label: "최소" },
  { value: "md", label: "중간" },
  { value: "lg", label: "최대" },
];

const SIZE_CLASS: Record<DateRangeModalSize, { panel: string; body: string; calendarGap: string }> = {
  sm: {
    panel: "max-w-[520px]",
    body: "px-4 py-3",
    calendarGap: "mt-3 grid gap-3",
  },
  md: {
    panel: "max-w-[760px]",
    body: "px-4 py-3",
    calendarGap: "mt-3 grid gap-4 sm:grid-cols-2",
  },
  lg: {
    panel: "max-w-[860px]",
    body: "px-5 py-4",
    calendarGap: "mt-4 grid gap-5 sm:grid-cols-2",
  },
};

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
  size = "md",
  onClose,
  onApply,
}: {
  open: boolean;
  value: DateRangeValue;
  title?: string;
  size?: DateRangeModalSize;
  onClose: () => void;
  onApply: (value: DateRangeValue) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [draft, setDraft] = useState<DateRangeValue>(() => normalizeRange(value.from, value.to));
  const [activeSize, setActiveSize] = useState<DateRangeModalSize>(size);
  const [cursor, setCursor] = useState(() => {
    const base = parseDateKey(value.from || toDateKey(today));
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  if (!open) return null;

  const rightCursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  const sizeClass = SIZE_CLASS[activeSize];
  const compact = activeSize === "sm";
  const tight = activeSize !== "lg";
  const showSecondCalendar = activeSize !== "sm";

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
      <section className={cn("flex max-h-[86vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900", sizeClass.panel)}>
        <header className={cn("flex items-center justify-between border-b border-slate-200 px-5 dark:border-slate-700", tight ? "h-12" : "h-[52px]")}>
          <h2 className={cn("font-black text-slate-900 dark:text-slate-50", tight ? "text-base" : "text-lg")}>{title}</h2>
          <div className="flex items-center gap-2">
            <div className="hidden overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950 sm:inline-flex">
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveSize(option.value)}
                  className={cn(
                    "h-6 rounded px-2 text-[11px] font-black text-slate-500 transition dark:text-slate-400",
                    activeSize === option.value && "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-300",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-300 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className={cn("overflow-y-auto", sizeClass.body)}>
          <div className={cn("rounded-md border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-950/30", tight ? "mb-2 py-2" : "mb-3 py-3")}>
            <div className={cn("flex flex-wrap items-center justify-center font-bold text-slate-600 dark:text-slate-300", tight ? "gap-2 text-sm" : "gap-3 text-base")}>
              <span>기준연도</span>
              <div className="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
                <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear() - 1, cursor.getMonth(), 1))} className={cn("grid place-items-center border-r border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800", tight ? "h-8 w-8" : "h-9 w-9")}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className={cn("grid place-items-center text-slate-900 dark:text-slate-50", tight ? "h-8 w-16" : "h-9 w-20")}>{cursor.getFullYear()}</div>
                <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear() + 1, cursor.getMonth(), 1))} className={cn("grid place-items-center border-l border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800", tight ? "h-8 w-8" : "h-9 w-9")}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <span className={cn("font-black text-slate-500 dark:text-slate-400", tight ? "text-xs" : "text-sm")}>{rangeLabel(draft)}</span>
            </div>
          </div>

          <div className={cn("grid gap-1.5", compact ? "grid-cols-7" : "grid-cols-7")}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "rounded-md border border-slate-300 bg-white font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-blue-950/40",
                  tight ? "h-7 px-1.5 text-xs" : "h-8 text-sm",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className={cn("mt-2 grid gap-1.5", compact ? "grid-cols-6" : "grid-cols-12")}>
            {Array.from({ length: 12 }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyMonth(index)}
                className={cn(
                  "rounded-md border border-slate-300 bg-white font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-blue-950/40",
                  tight ? "h-7 px-1.5 text-xs" : "h-8 text-sm",
                )}
              >
                {index + 1}월
              </button>
            ))}
          </div>

          <div className={sizeClass.calendarGap}>
            <MonthCalendar
              cursor={cursor}
              draft={draft}
              onSelect={selectDate}
              onPrev={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              size={activeSize}
            />
            {showSecondCalendar && (
              <MonthCalendar
                cursor={rightCursor}
                draft={draft}
                onSelect={selectDate}
                onNext={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                size={activeSize}
              />
            )}
          </div>
        </div>

        <footer className={cn("flex justify-end gap-2 border-t border-slate-200 px-5 dark:border-slate-700", tight ? "py-3" : "py-4")}>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className={cn("inline-flex items-center gap-2 rounded-md bg-blue-500 font-black text-white transition hover:bg-blue-600", tight ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm")}
          >
            <Check className="h-4 w-4" />
            적용
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn("inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800", tight ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm")}
          >
            <X className="h-4 w-4" />
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
  size = "md",
}: {
  cursor: Date;
  draft: DateRangeValue;
  onSelect: (key: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  size?: DateRangeModalSize;
}) {
  const cells = getMonthCells(cursor.getFullYear(), cursor.getMonth());
  const todayKey = toDateKey(new Date());
  const compact = size === "sm";
  const tight = size !== "lg";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <div className={cn("flex items-center justify-between bg-slate-100 px-3 dark:bg-slate-800", tight ? "h-9" : "h-10")}>
        <button type="button" onClick={onPrev} className={cn("text-slate-400 hover:text-slate-700", !onPrev && "invisible")}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" className={cn("inline-flex items-center gap-1 font-black text-slate-800 dark:text-slate-50", tight ? "text-sm" : "text-base")}>
          {cursor.getMonth() + 1}월 {cursor.getFullYear()}
        </button>
        <button type="button" onClick={onNext} className={cn("text-slate-400 hover:text-slate-700", !onNext && "invisible")}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center dark:border-slate-700 dark:bg-slate-800">
        {WEEKDAYS.map((day) => (
          <div key={day} className={cn("font-black text-slate-700 dark:text-slate-200", tight ? "py-1 text-xs" : "py-1.5 text-sm")}>
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
                "grid place-items-center font-bold transition",
                compact ? "h-7 text-xs" : tight ? "h-8 text-xs" : "h-9 text-sm",
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
      <div className={cn("flex justify-center border-t border-slate-100 dark:border-slate-800", tight ? "py-1.5" : "py-2")}>
        <button
          type="button"
          onClick={() => onSelect(todayKey)}
          className={cn("rounded-md border border-slate-300 bg-white font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200", tight ? "px-2.5 py-1 text-xs" : "px-3 py-1 text-sm")}
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
