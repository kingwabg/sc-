"use client";

/**
 * StaffFilterDrawer — rsuite Drawer + DateRangePicker + CheckPicker + Toggle
 */
import { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  ButtonGroup,
  Form,
  DateRangePicker,
  CheckPicker,
  Toggle,
  Divider,
} from "rsuite";
import { RotateCcw, Check } from "lucide-react";
import { POSITION_LABELS, type Staff, type StaffPosition } from "@/lib/staff";

export type StaffFilter = {
  /** rsuite DateRange는 `[Date, Date]` 또는 `null` */
  joinRange: [Date, Date] | null;
  positions: StaffPosition[];
  statuses: Staff["status"][];
};

const DEFAULT_FILTER: StaffFilter = {
  joinRange: null,
  positions: [],
  statuses: [],
};

const STATUS_OPTS: { label: string; value: Staff["status"] }[] = [
  { label: "재직", value: "active" },
  { label: "휴직", value: "leave" },
  { label: "퇴직", value: "retired" },
];

const POS_OPTS = (Object.keys(POSITION_LABELS) as StaffPosition[]).map((p) => ({
  label: POSITION_LABELS[p],
  value: p,
}));

type Props = {
  open: boolean;
  value: StaffFilter;
  onChange: (next: StaffFilter) => void;
  onClose: () => void;
  matched?: number;
  total?: number;
};

export function StaffFilterDrawer({ open, value, onChange, onClose, matched, total }: Props) {
  const [draft, setDraft] = useState<StaffFilter>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

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
    draft.joinRange === null &&
    draft.positions.length === 0 &&
    draft.statuses.length === 0;

  return (
    <Drawer open={open} onClose={onClose} placement="right" size="sm">
      <Drawer.Header closeButton={false}>
        <Drawer.Title>상세 필터</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <Form fluid>
          <Field label="입사 기간">
            <DateRangePicker
              value={draft.joinRange}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  joinRange: (v ?? null) as [Date, Date] | null,
                })
              }
              placeholder="전체 기간"
              format="yyyy-MM-dd"
              cleanable
              block
            />
          </Field>

          <Divider />

          <Field label="직위">
            <CheckPicker
              data={POS_OPTS}
              value={draft.positions}
              onChange={(v) =>
                setDraft({ ...draft, positions: (v ?? []) as StaffPosition[] })
              }
              placeholder="전체"
              block
            />
          </Field>

          <Divider />

          <Field label="상태">
            <div className="space-y-2.5 pt-2">
              {STATUS_OPTS.map((s) => {
                const on = draft.statuses.includes(s.value);
                return (
                  <div key={s.value} className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-700">{s.label}</span>
                    <Toggle
                      checked={on}
                      onChange={(checked) => {
                        const next = checked
                          ? Array.from(new Set([...draft.statuses, s.value]))
                          : draft.statuses.filter((x) => x !== s.value);
                        setDraft({ ...draft, statuses: next });
                      }}
                    />
                  </div>
                );
              })}
            </div>
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
