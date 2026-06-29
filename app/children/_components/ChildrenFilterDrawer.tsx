"use client";

/**
 * ChildrenFilterDrawer — rsuite Drawer + DateRangePicker + CheckPicker + InputPicker
 */
import { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  Button,
  ButtonGroup,
  Form,
  DateRangePicker,
  CheckPicker,
  Divider,
} from "rsuite";
import { RotateCcw, Check } from "lucide-react";

export type ChildrenFilter = {
  enrolledRange: [Date, Date] | null;
  grades: string[];
  allergies: string[];
  statuses: string[];
};

const GRADES = ["초1", "초2", "초3", "초4", "초5", "초6"];
const STATUSES = ["등원", "결석", "조퇴", "보건휴식", "미등원"];

const DEFAULT_FILTER: ChildrenFilter = {
  enrolledRange: null,
  grades: [],
  allergies: [],
  statuses: [],
};

type Props = {
  open: boolean;
  value: ChildrenFilter;
  onChange: (next: ChildrenFilter) => void;
  onClose: () => void;
  /** 가능한 알레르기 목록 (전체 자식 데이터에서 추출) */
  allergyOptions: string[];
  matched?: number;
  total?: number;
};

export function ChildrenFilterDrawer({
  open,
  value,
  onChange,
  onClose,
  allergyOptions,
  matched,
  total,
}: Props) {
  const [draft, setDraft] = useState<ChildrenFilter>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const allergyOpts = useMemo(
    () => allergyOptions.map((a) => ({ label: a, value: a })),
    [allergyOptions],
  );
  const gradeOpts = GRADES.map((g) => ({ label: g, value: g }));
  const statusOpts = STATUSES.map((s) => ({ label: s, value: s }));

  function apply() {
    onChange(draft);
    onClose();
  }
  function reset() {
    setDraft(DEFAULT_FILTER);
    onChange(DEFAULT_FILTER);
    onClose();
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(value);
  const isDefault =
    draft.enrolledRange === null &&
    draft.grades.length === 0 &&
    draft.allergies.length === 0 &&
    draft.statuses.length === 0;

  return (
    <Drawer open={open} onClose={onClose} placement="right" size="sm">
      <Drawer.Header closeButton={false}>
        <Drawer.Title>상세 필터</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <Form fluid>
          <Field label="등록일">
            <DateRangePicker
              value={draft.enrolledRange}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  enrolledRange: (v ?? null) as [Date, Date] | null,
                })
              }
              placeholder="전체 기간"
              format="yyyy-MM-dd"
              cleanable
              block
            />
          </Field>

          <Divider />

          <Field label="학년">
            <CheckPicker
              data={gradeOpts}
              value={draft.grades}
              onChange={(v) => setDraft({ ...draft, grades: (v ?? []) as string[] })}
              placeholder="전체"
              block
            />
          </Field>

          <Divider />

          <Field label="알레르기">
            <CheckPicker
              data={allergyOpts}
              value={draft.allergies}
              onChange={(v) =>
                setDraft({ ...draft, allergies: (v ?? []) as string[] })
              }
              placeholder="전체"
              block
            />
          </Field>

          <Divider />

          <Field label="오늘 출석">
            <CheckPicker
              data={statusOpts}
              value={draft.statuses}
              onChange={(v) =>
                setDraft({ ...draft, statuses: (v ?? []) as string[] })
              }
              placeholder="전체"
              block
            />
          </Field>
        </Form>
      </Drawer.Body>
      <Drawer.Footer>
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-[12px] text-slate-500">
            {matched != null && total != null ? (
              <>총 <strong className="text-slate-900">{total}</strong> 중{" "}
                <strong className="text-brand-700">{matched}</strong>명</>
            ) : (
              <>필터를 선택하세요</>
            )}
          </span>
          <ButtonGroup>
            <Button
              onClick={reset}
              appearance="subtle"
              startIcon={<RotateCcw className="w-3.5 h-3.5" />}
              disabled={isDefault}
            >
              초기화
            </Button>
            <Button
              onClick={apply}
              appearance="primary"
              disabled={!isDirty}
              startIcon={<Check className="w-3.5 h-3.5" />}
            >
              적용
            </Button>
          </ButtonGroup>
        </div>
      </Drawer.Footer>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
