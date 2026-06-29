"use client";

/**
 * TableOptions + TableOptionsDrawer
 *
 * rsuite 사이트의 Table 페이지 기능을 옵션 드로어에서 토글로 제어.
 * 토글이 즉시 부모 state에 반영 — 별도 "적용" 버튼 없음 (즉시 적용).
 */
import { useMemo } from "react";
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
import { RotateCcw, Table2 } from "lucide-react";

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
  height: number;        // 키 (고정)
  minHeight: number;     // 최소 높이 (0 = 제한 없음)
  maxHeight: number;     // 최대 높이 (0 = 제한 없음)
  pageSizeRows: number;  // 화면에 보일 데이터 행 (1~999, 표시용)
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

type Props = {
  open: boolean;
  value: TableOptions;
  onChange: (next: TableOptions) => void;
  onClose: () => void;
};

export function TableOptionsDrawer({ open, value, onChange, onClose }: Props) {
  const patch = (p: Partial<TableOptions>) => onChange({ ...value, ...p });
  const activeCount = useMemo(() => countActive(value), [value]);

  const numCls =
    "w-full h-9 px-3 bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

  return (
    <Drawer open={open} onClose={onClose} placement="right" size="md">
      <Drawer.Header closeButton={false}>
        <Drawer.Title>
          <span className="inline-flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            테이블 옵션
            {activeCount > 0 && (
              <span className="ml-1 text-[11px] font-semibold text-brand-600 bg-brand-50 rounded-full px-2 py-0.5">
                {activeCount}개 적용중
              </span>
            )}
          </span>
        </Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        {/* ── 테이블 높이 (rsuite 사이트 예제와 동일) ── */}
        <Section title="테이블 높이">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-slate-700">자동 높이 조절</span>
            <Toggle
              checked={value.autoHeight}
              onChange={(v) => patch({ autoHeight: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* 데이터 */}
            <KVField label="데이터">
              <div className="flex items-center gap-2">
                <NumberInput
                  value={value.pageSizeRows}
                  onChange={(v) => patch({ pageSizeRows: Number(v) || 1, pageSize: Number(v) || 20 })}
                  min={1}
                  max={999}
                  step={1}
                  className="flex-1"
                />
                <span className="text-[12px] text-slate-500 shrink-0">행</span>
              </div>
            </KVField>

            {/* 최소 높이 */}
            <KVField label="최소 높이">
              <div className="flex items-center gap-2">
                <NumberInput
                  value={value.minHeight}
                  onChange={(v) => patch({ minHeight: Number(v) || 0 })}
                  min={0}
                  max={2000}
                  step={10}
                  className="flex-1"
                  disabled={value.autoHeight}
                />
                <span className="text-[12px] text-slate-500 shrink-0">px</span>
              </div>
            </KVField>

            {/* 키 (고정 높이) */}
            <KVField label="키">
              <div className="flex items-center gap-2">
                <NumberInput
                  value={value.height}
                  onChange={(v) => patch({ height: Number(v) || 200 })}
                  min={200}
                  max={2000}
                  step={10}
                  className="flex-1"
                  disabled={value.autoHeight}
                />
                <span className="text-[12px] text-slate-500 shrink-0">px</span>
              </div>
            </KVField>

            {/* 최대 높이 */}
            <KVField label="최대 높이">
              <div className="flex items-center gap-2">
                <NumberInput
                  value={value.maxHeight}
                  onChange={(v) => patch({ maxHeight: Number(v) || 0 })}
                  min={0}
                  max={2000}
                  step={10}
                  className="flex-1"
                  placeholder="무제한"
                />
                <span className="text-[12px] text-slate-500 shrink-0">px</span>
              </div>
            </KVField>
          </div>

          {/* 자동 높이 안내 */}
          {value.autoHeight ? (
            <p className="text-[11px] text-slate-400 mt-3 bg-slate-50 px-3 py-2 rounded">
              자동 켜짐 — 테이블이 데이터 양에 맞춰 늘어나고 줄어듭니다.
              최소/최대 높이로 부드럽게 제한 가능합니다.
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-3 bg-slate-50 px-3 py-2 rounded">
              자동 꺼짐 — 키({value.height}px)로 고정됩니다.
              최소/최대 높이로 범위 제한 가능.
            </p>
          )}
        </Section>

        <Divider />

        {/* ── 행 높이 / 밀도 ── */}
        <Section title="행 높이 / 밀도">
          <div className="mb-3">
            <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              밀도 (density)
            </label>
            <RadioGroup
              name="density"
              inline
              value={value.density}
              onChange={(v) => patch({ density: v as TableDensity })}
            >
              <Radio value="compact">좁게</Radio>
              <Radio value="normal">보통</Radio>
              <Radio value="comfortable">넓게</Radio>
            </RadioGroup>
          </div>
        </Section>

        <Divider />

        {/* ── 테두리 / 호버 ── */}
        <Section title="테두리 / 호버">
          <ToggleRow
            label="테두리 표시 (bordered)"
            checked={value.bordered}
            onChange={(v) => patch({ bordered: v })}
          />
          <ToggleRow
            label="셀 테두리 (cellBordered)"
            checked={value.cellBordered}
            onChange={(v) => patch({ cellBordered: v })}
          />
          <ToggleRow
            label="행 hover 효과"
            checked={value.hover}
            onChange={(v) => patch({ hover: v })}
          />
        </Section>

        <Divider />

        {/* ── 컬럼 동작 ── */}
        <Section title="컬럼 동작">
          <ToggleRow
            label="컬럼 리사이즈 (resizable)"
            checked={value.resizable}
            onChange={(v) => patch({ resizable: v })}
          />
          <ToggleRow
            label="컬럼 정렬 (sortable)"
            checked={value.sortable}
            onChange={(v) => patch({ sortable: v })}
          />
          <ToggleRow
            label="단어 줄바꿈 (wordWrap)"
            checked={value.wordWrap}
            onChange={(v) => patch({ wordWrap: v })}
          />
          <ToggleRow
            label="셀 hover 시 전체 텍스트 (fullText)"
            checked={value.fullText}
            onChange={(v) => patch({ fullText: v })}
          />
          <ToggleRow
            label="행 펼침 (expandable)"
            checked={value.expandable}
            onChange={(v) => patch({ expandable: v })}
          />
        </Section>

        <Divider />

        {/* ── 페이지네이션 ── */}
        <Section title="페이지네이션">
          <ToggleRow
            label="페이지네이션 (pagination)"
            checked={value.paginated}
            onChange={(v) => patch({ paginated: v })}
          />
          <div className={value.paginated ? "" : "opacity-40 pointer-events-none"}>
            <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              페이지 크기
            </label>
            <SelectPicker
              data={[
                { label: "10행", value: 10 },
                { label: "20행", value: 20 },
                { label: "50행", value: 50 },
                { label: "100행", value: 100 },
              ]}
              value={value.pageSize}
              onChange={(v) => patch({ pageSize: Number(v) })}
              block
              cleanable={false}
            />
          </div>
        </Section>

        <Divider />

        {/* ── 기타 ── */}
        <Section title="기타">
          <ToggleRow
            label="로딩 상태 표시 (loading)"
            checked={value.loading}
            onChange={(v) => patch({ loading: v })}
          />
        </Section>
      </Drawer.Body>
      <Drawer.Footer>
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-[12px] text-slate-500">
            {activeCount > 0 ? "변경사항 즉시 반영됨" : "기본값"}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <h3 className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-slate-700">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function KVField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-slate-600">{label}</label>
      {children}
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
