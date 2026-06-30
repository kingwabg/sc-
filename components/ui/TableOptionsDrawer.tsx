"use client";

/**
 * TableOptions + TableOptionsDrawer
 *
 * UX: 초보자/어르신 친화적
 *  - 상단: 보기 모드 프리셋 (한 번 클릭으로 모든 옵션 적용)
 *  - 중단: 기본 설정 4개 (행 높이 / 페이지당 행 / 칸 크기 / 정렬)
 *  - 하단: "더 보기" 토글 → 전문 옵션
 *
 * 토글이 즉시 부모 state에 반영 — 별도 "적용" 버튼 없음.
 */

import { useMemo, useState } from "react";
import {
  Drawer,
  Button,
  Divider,
  Toggle,
  SelectPicker,
  Radio,
  RadioGroup,
  NumberInput,
} from "rsuite";
import { RotateCcw, Table2, ChevronDown, ChevronUp, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 타입 ─────────────────────────────────────────────────────

export type TableDensity = "compact" | "normal" | "comfortable";

export type TableOptions = {
  bordered: boolean;
  cellBordered: boolean;
  hover: boolean;
  resizable: boolean;
  sortable: boolean;
  paginated: boolean;
  pageSize: number;
  wordWrap: boolean;
  fullText: boolean;
  expandable: boolean;
  density: TableDensity;
  loading: boolean;
  // === rsuite Table Height 예제와 동일 ===
  autoHeight: boolean;
  height: number;
  minHeight: number;
  maxHeight: number;
  pageSizeRows: number;
};

export const DEFAULT_TABLE_OPTIONS: TableOptions = {
  bordered: true,
  cellBordered: true,
  hover: true,
  resizable: true,
  sortable: true,
  paginated: true,
  pageSize: 20,
  wordWrap: false,
  fullText: true,
  expandable: true,
  density: "normal",
  loading: false,
  autoHeight: true,
  height: 520,
  minHeight: 200,
  maxHeight: 800,
  pageSizeRows: 20,
};

// ─── 프리셋 정의 ──────────────────────────────────────────────
// 한 번 클릭으로 모든 옵션 한꺼번에 적용. 초보자/어르신이 가장 자주 쓸 진입점.

type Preset = {
  id: string;
  label: string;
  hint: string;
  emoji: string;
  options: TableOptions;
};

const PRESETS: Preset[] = [
  {
    id: "default",
    label: "기본",
    hint: "보편적인 설정",
    emoji: "📊",
    options: DEFAULT_TABLE_OPTIONS,
  },
  {
    id: "large",
    label: "크게 보기",
    hint: "글자 큼, 여유 있게",
    emoji: "👀",
    options: { ...DEFAULT_TABLE_OPTIONS, density: "comfortable", pageSize: 10 },
  },
  {
    id: "xlarge",
    label: "아주 크게",
    hint: "터치·약시 친화",
    emoji: "🔍",
    options: {
      ...DEFAULT_TABLE_OPTIONS,
      density: "comfortable",
      pageSize: 8,
      fullText: true,
      resizable: true,
    },
  },
  {
    id: "compact",
    label: "한눈에",
    hint: "데이터 많을 때",
    emoji: "📋",
    options: { ...DEFAULT_TABLE_OPTIONS, density: "compact", pageSize: 50 },
  },
  {
    id: "print",
    label: "인쇄용",
    hint: "흑백·깔끔",
    emoji: "🖨",
    options: { ...DEFAULT_TABLE_OPTIONS, hover: false, cellBordered: false, fullText: true },
  },
];

// ─── 컴포넌트 ────────────────────────────────────────────────

type Props = {
  open: boolean;
  value: TableOptions;
  onChange: (next: TableOptions) => void;
  onClose: () => void;
};

export function TableOptionsDrawer({ open, value, onChange, onClose }: Props) {
  const patch = (p: Partial<TableOptions>) => onChange({ ...value, ...p });
  const activeCount = useMemo(() => countActive(value), [value]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 현재 어떤 프리셋이 매칭되는지 (기본값 = "default")
  const matchedPresetId = useMemo(() => {
    for (const p of PRESETS) {
      if (optionsEqual(p.options, value)) return p.id;
    }
    return null; // 커스텀
  }, [value]);

  return (
    <Drawer open={open} onClose={onClose} placement="right" size="md">
      <Drawer.Header closeButton={false}>
        <Drawer.Title>
          <span className="inline-flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            테이블 옵션
            {activeCount > 0 ? (
              <span className="ml-1 text-[11px] font-semibold text-brand-600 bg-brand-50 rounded-full px-2 py-0.5">
                {activeCount}개 적용중
              </span>
            ) : (
              <span className="ml-1 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                기본값
              </span>
            )}
          </span>
        </Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        {/* ── 프리셋 (보기 모드) ── */}
        <Section
          title="보기 모드"
          icon={<Sparkles className="w-3.5 h-3.5 text-brand-500" />}
          hint="한 번 클릭으로 모든 옵션이 설정돼요"
        >
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const isActive = matchedPresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onChange(p.options)}
                  className={cn(
                    "rounded-xl border-2 p-2.5 text-left transition group",
                    isActive
                      ? "border-brand-500 bg-brand-50/60 shadow-sm"
                      : "border-slate-200 hover:border-brand-300 hover:bg-slate-50",
                  )}
                >
                  <div className="text-2xl mb-0.5">{p.emoji}</div>
                  <div className="text-[13px] font-bold text-slate-900 leading-tight">
                    {p.label}
                  </div>
                  <div className="text-[10.5px] text-slate-500 mt-0.5 leading-tight">
                    {p.hint}
                  </div>
                </button>
              );
            })}
          </div>
          {matchedPresetId === null && (
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded mt-2">
              커스텀 설정 사용 중 — 프리셋을 누르면 덮어씌워져요
            </p>
          )}
        </Section>

        <Divider />

        {/* ── 기본 설정 (평이화 + 핵심 4개) ── */}
        <Section
          title="기본 설정"
          hint="자주 바꾸는 항목만 모았어요"
        >
          {/* 행 높이 (density) */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              행 높이
            </label>
            <RadioGroup
              name="density"
              inline
              value={value.density}
              onChange={(v) => patch({ density: v as TableDensity })}
            >
              <Radio value="compact">작게</Radio>
              <Radio value="normal">보통</Radio>
              <Radio value="comfortable">크게</Radio>
            </RadioGroup>
            <p className="text-[10.5px] text-slate-400 mt-1">
              글자 크기·터치 편의에 따라 선택
            </p>
          </div>

          {/* 페이지당 행 수 */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              한 번에 보이는 행
            </label>
            <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-0.5 shadow-sm text-xs">
              {[10, 20, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => patch({ pageSize: n, pageSizeRows: n })}
                  className={cn(
                    "px-3 h-8 rounded-md font-medium transition",
                    value.pageSize === n
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {n}개
                </button>
              ))}
            </div>
          </div>

          {/* 칸 크기 자유 조절 */}
          <ToggleRow
            label="칸 크기 자유 조절"
            hint="마우스로 칸 너비 조절"
            checked={value.resizable}
            onChange={(v) => patch({ resizable: v })}
          />

          {/* 제목 클릭 정렬 */}
          <ToggleRow
            label="제목 클릭으로 정렬"
            hint="컬럼 헤더를 누르면 정렬"
            checked={value.sortable}
            onChange={(v) => patch({ sortable: v })}
          />
        </Section>

        <Divider />

        {/* ── 더 보기 (전문 옵션) ── */}
        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition text-left"
        >
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
            <Eye className="w-3.5 h-3.5" />
            더 보기 (전문 옵션)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-2">
            {/* 페이지 나누기 */}
            <Section title="페이지">
              <ToggleRow
                label="페이지 나누기"
                hint="한 페이지에 행 개수만큼만 표시"
                checked={value.paginated}
                onChange={(v) => patch({ paginated: v })}
              />
            </Section>

            {/* 테두리 / 호버 */}
            <Section title="테두리 / 강조">
              <ToggleRow
                label="바깥 테두리"
                hint="테이블 외곽선 표시"
                checked={value.bordered}
                onChange={(v) => patch({ bordered: v })}
              />
              <ToggleRow
                label="모든 칸에 선"
                hint="셀 사이에도 선 표시"
                checked={value.cellBordered}
                onChange={(v) => patch({ cellBordered: v })}
              />
              <ToggleRow
                label="행 강조 효과"
                hint="마우스 올린 행을 밝게"
                checked={value.hover}
                onChange={(v) => patch({ hover: v })}
              />
            </Section>

            {/* 행 펼침 / 텍스트 */}
            <Section title="행 펼침 / 텍스트">
              <ToggleRow
                label="누르면 상세 펼치기"
                hint="행을 클릭하면 아래로 상세 정보"
                checked={value.expandable}
                onChange={(v) => patch({ expandable: v })}
              />
              <ToggleRow
                label="긴 글자 자동 줄바꿈"
                hint="한 줄이 길면 자동으로 줄바꿈"
                checked={value.wordWrap}
                onChange={(v) => patch({ wordWrap: v })}
              />
              <ToggleRow
                label="짧게 잘리면 전체 보기"
                hint="칸에 안 들어가면 마우스 올릴 때 전체 표시"
                checked={value.fullText}
                onChange={(v) => patch({ fullText: v })}
              />
            </Section>

            {/* 테이블 높이 */}
            <Section title="테이블 높이">
              <ToggleRow
                label="높이 자동 조절"
                hint="데이터 양에 맞춰 늘고 줄어듦"
                checked={value.autoHeight}
                onChange={(v) => patch({ autoHeight: v })}
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mt-2">
                <NumberField
                  label="최소 높이 (px)"
                  value={value.minHeight}
                  onChange={(v) => patch({ minHeight: Number(v) || 0 })}
                  disabled={value.autoHeight}
                />
                <NumberField
                  label="고정 높이 (px)"
                  value={value.height}
                  onChange={(v) => patch({ height: Number(v) || 200 })}
                  disabled={value.autoHeight}
                />
                <NumberField
                  label="최대 높이 (px)"
                  value={value.maxHeight}
                  onChange={(v) => patch({ maxHeight: Number(v) || 0 })}
                  placeholder="0 = 무제한"
                />
                <NumberField
                  label="표시 행 (표시용)"
                  value={value.pageSizeRows}
                  onChange={(v) => patch({ pageSizeRows: Number(v) || 1 })}
                />
              </div>
            </Section>

            {/* 기타 */}
            <Section title="기타">
              <ToggleRow
                label="불러오는 중 표시"
                hint="데이터 로드 중 회전 애니메이션"
                checked={value.loading}
                onChange={(v) => patch({ loading: v })}
              />
            </Section>
          </div>
        )}
      </Drawer.Body>
      <Drawer.Footer>
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-[12px] text-slate-500">
            {activeCount > 0 ? "변경 즉시 반영됨" : "기본값 사용 중"}
          </span>
          <Button
            onClick={() => onChange(DEFAULT_TABLE_OPTIONS)}
            appearance="subtle"
            startIcon={<RotateCcw className="w-3.5 h-3.5" />}
            disabled={activeCount === 0}
          >
            기본값으로 리셋
          </Button>
        </div>
      </Drawer.Footer>
    </Drawer>
  );
}

// ─── 작은 헬퍼들 ─────────────────────────────────────────────

function Section({
  title,
  icon,
  hint,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
        {icon}
        {title}
      </h3>
      {hint && (
        <p className="text-[11px] text-slate-400 mb-2.5 -mt-1">{hint}</p>
      )}
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-slate-700 font-medium">{label}</div>
        {hint && (
          <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number | string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11.5px] font-medium text-slate-600">{label}</label>
      <NumberInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        size="sm"
      />
    </div>
  );
}

function countActive(o: TableOptions): number {
  let n = 0;
  (Object.keys(DEFAULT_TABLE_OPTIONS) as Array<keyof TableOptions>).forEach((k) => {
    if (o[k] !== DEFAULT_TABLE_OPTIONS[k]) n++;
  });
  return n;
}

function optionsEqual(a: TableOptions, b: TableOptions): boolean {
  return (Object.keys(a) as Array<keyof TableOptions>).every(
    (k) => a[k] === b[k],
  );
}