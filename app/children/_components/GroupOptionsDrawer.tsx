"use client";

import { useState, useEffect } from "react";
import { Drawer, Button, Checkbox, DatePicker, CheckboxGroup } from "rsuite";
import { cn } from "@/lib/utils";
import { ATTENDANCE_STATUSES } from "@/lib/features/children/utils";
import type { GroupFilter, AttendanceStatus } from "@/lib/features/children/types";

const GRADES = ["초1", "초2", "초3", "초4", "초5", "초6"] as const;

type Props = {
  open: boolean;
  groupLabel: string;
  initial: GroupFilter | undefined;
  allergyOptions: string[];
  matchedCount: number;
  totalCount: number;
  onClose: () => void;
  onSave: (filter: GroupFilter | null) => void;
};

export function GroupOptionsDrawer({
  open,
  groupLabel,
  initial,
  allergyOptions,
  matchedCount,
  totalCount,
  onClose,
  onSave,
}: Props) {
  const [grades, setGrades] = useState<string[]>(initial?.grades ?? []);
  const [genders, setGenders] = useState<("M" | "F")[]>(initial?.genders ?? []);
  const [allergies, setAllergies] = useState<string[]>(initial?.allergies ?? []);
  const [enrolledAfter, setEnrolledAfter] = useState(initial?.enrolledAfter ?? "");
  const [enrolledBefore, setEnrolledBefore] = useState(initial?.enrolledBefore ?? "");
  const [statuses, setStatuses] = useState<AttendanceStatus[]>(initial?.statuses ?? []);

  useEffect(() => {
    if (open) {
      setGrades(initial?.grades ?? []);
      setGenders(initial?.genders ?? []);
      setAllergies(initial?.allergies ?? []);
      setEnrolledAfter(initial?.enrolledAfter ?? "");
      setEnrolledBefore(initial?.enrolledBefore ?? "");
      setStatuses(initial?.statuses ?? []);
    }
  }, [open, initial]);

  function toggleIn<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function handleSave() {
    const empty =
      grades.length === 0 &&
      genders.length === 0 &&
      allergies.length === 0 &&
      !enrolledAfter &&
      !enrolledBefore &&
      statuses.length === 0;
    if (empty) {
      onSave(null);
    } else {
      onSave({
        ...(grades.length > 0 && { grades }),
        ...(genders.length > 0 && { genders }),
        ...(allergies.length > 0 && { allergies }),
        ...(enrolledAfter && { enrolledAfter }),
        ...(enrolledBefore && { enrolledBefore }),
        ...(statuses.length > 0 && { statuses }),
      });
    }
    onClose();
  }

  function handleReset() {
    onSave(null);
    onClose();
  }

  const isAny =
    grades.length > 0 ||
    genders.length > 0 ||
    allergies.length > 0 ||
    !!enrolledAfter ||
    !!enrolledBefore ||
    statuses.length > 0;

  return (
    <Drawer open={open} onClose={onClose} placement="right" size="sm">
      <Drawer.Header>
        <Drawer.Title>폴더 조건 — {groupLabel}</Drawer.Title>
        <Drawer.Actions>
          <Button appearance="subtle" onClick={onClose}>취소</Button>
        </Drawer.Actions>
      </Drawer.Header>
      <Drawer.Body className="space-y-5">
        {/* Preview count */}
        <div className="rounded-lg bg-brand-50 border border-brand-200 px-3 py-2.5 text-[12.5px] text-brand-700">
          <strong className="font-bold">{matchedCount}명</strong> / 전체 {totalCount}명이 매칭돼요
        </div>

        {/* 학년 */}
        <section>
          <h4 className="text-[12px] font-bold text-slate-700 mb-2">학년</h4>
          <div className="flex flex-wrap gap-1.5">
            {GRADES.map((g) => {
              const on = grades.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrades((prev) => toggleIn(prev, g))}
                  className={cn(
                    "h-7 px-3 rounded-md text-[12px] font-medium border transition",
                    on
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                  )}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </section>

        {/* 성별 */}
        <section>
          <h4 className="text-[12px] font-bold text-slate-700 mb-2">성별</h4>
          <div className="flex gap-1.5">
            {(["F", "M"] as const).map((g) => {
              const on = genders.includes(g);
              const label = g === "F" ? "여" : "남";
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenders((prev) => toggleIn(prev, g))}
                  className={cn(
                    "h-7 px-3 rounded-md text-[12px] font-medium border transition",
                    on
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 알레르기 */}
        <section>
          <h4 className="text-[12px] font-bold text-slate-700 mb-2">알레르기</h4>
          {allergyOptions.length === 0 ? (
            <p className="text-[12px] text-slate-400">등록된 알레르기가 없어요</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {allergyOptions.map((a) => {
                const on = allergies.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAllergies((prev) => toggleIn(prev, a))}
                    className={cn(
                      "h-7 px-3 rounded-md text-[12px] font-medium border transition",
                      on
                        ? "bg-amber-50 border-amber-500 text-amber-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 등록일 */}
        <section>
          <h4 className="text-[12px] font-bold text-slate-700 mb-2">등록일</h4>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={enrolledAfter}
              onChange={(e) => setEnrolledAfter(e.target.value)}
              className="flex-1 px-2 py-1.5 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
            />
            <span className="text-[11px] text-slate-400">~</span>
            <input
              type="date"
              value={enrolledBefore}
              onChange={(e) => setEnrolledBefore(e.target.value)}
              className="flex-1 px-2 py-1.5 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
            />
          </div>
        </section>

        {/* 출석 상태 */}
        <section>
          <h4 className="text-[12px] font-bold text-slate-700 mb-2">출석 상태</h4>
          <div className="flex flex-wrap gap-1.5">
            {ATTENDANCE_STATUSES.map((s) => {
              const on = statuses.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatuses((prev) => toggleIn(prev, s))}
                  className={cn(
                    "h-7 px-3 rounded-md text-[12px] font-medium border transition",
                    on
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                  )}
                >
                  {s === "보건휴식" ? "보건" : s}
                </button>
              );
            })}
          </div>
        </section>
      </Drawer.Body>
      <Drawer.Footer className="flex items-center justify-between gap-2">
        {isAny ? (
          <Button appearance="link" color="red" onClick={handleReset}>조건 해제</Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button appearance="subtle" onClick={onClose}>취소</Button>
          <Button appearance="primary" onClick={handleSave}>저장</Button>
        </div>
      </Drawer.Footer>
    </Drawer>
  );
}