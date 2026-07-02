"use client";

/**
 * ResourceTable — 도메인 무관 제네릭 데이터 테이블
 *
 * ChildrenTable에서 추출한 RSuite Table 래퍼.
 * columns/renderExpanded를 외부에서 주입받아 어떤 도메인(아동/종사자/...)에도 재사용.
 *
 * 책임:
 *  - RSuite Table 옵션 매핑 (height/density/hover/bordered/...)
 *  - 페이지네이션 (options.pageSize 기준 슬라이스)
 *  - 행 펼침 상태 (expandedIds 캡슐화)
 *  - 기본 하단 바 (총 N명 + Pagination)
 *
 * 책임 아님 (외부):
 *  - 컬럼 정의 (columns prop)
 *  - 펼침 패널 렌더링 (renderExpanded prop)
 *  - row 데이터 매핑 (페이지에서 domain → row 변환)
 */

import { useMemo, useState } from "react";
import { Table, Pagination } from "rsuite";
import type { TableOptions, TableDensity } from "@/components/ui/TableOptionsDrawer";

export type ColumnCellHelpers<T> = {
  /** 이 행이 현재 펼쳐져 있는지 */
  isExpanded: boolean;
  /** 이 행 펼침/접기 토글 */
  toggleExpand: () => void;
  /** 현재 density (compact/normal/comfortable) */
  density: TableDensity;
};

export type ColumnDef<T> = {
  /** 고유 키 (React key + 컬럼 식별) */
  key: string;
  header: React.ReactNode;
  width?: number;
  flexGrow?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  /** false면 sortable 강제 off. 미지정 시 options.sortable 따름 */
  sortable?: boolean;
  /** false면 resizable 강제 off. 미지정 시 options.resizable 따름 */
  resizable?: boolean;
  /** 미지정 시 options.fullText 따름 */
  fullText?: boolean;
  cell: (row: T, helpers: ColumnCellHelpers<T>) => React.ReactNode;
};

export type BottomBarContext = {
  /** 전체 행 수 (페이지네이션 전) */
  total: number;
  /** 현재 페이지 (1-indexed) */
  page: number;
  /** 현재 페이지에 보이는 행 수 */
  rowsInPage: number;
  options: TableOptions;
  onPageChange: (page: number) => void;
};

export type ResourceTableProps<T> = {
  data: T[];
  rowKey: (row: T) => string;
  options: TableOptions;
  columns: ColumnDef<T>[];
  /** 펼침 영역 렌더러. 미지정 시 펼침 기능 비활성 */
  renderExpanded?: (row: T) => React.ReactNode;
  expandedRowHeight?: number;
  locale?: { emptyMessage?: string; loading?: string };
  /** 하단 바 커스터마이즈. 미지정 시 기본 카운트+페이지네이션 */
  bottomBar?: (ctx: BottomBarContext) => React.ReactNode;
};

const ROW_HEIGHT: Record<TableDensity, number> = {
  compact: 36,
  normal: 46,
  comfortable: 56,
};
const HEADER_HEIGHT: Record<TableDensity, number> = {
  compact: 36,
  normal: 40,
  comfortable: 44,
};

export function ResourceTable<T extends Record<string, any>>({
  data,
  rowKey,
  options,
  columns,
  renderExpanded,
  expandedRowHeight = 180,
  locale,
  bottomBar,
}: ResourceTableProps<T>) {
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const pageRows = useMemo(
    () => data.slice((page - 1) * options.pageSize, page * options.pageSize),
    [data, page, options.pageSize],
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const hasExpansion = !!renderExpanded;

  return (
    <div className="resource-table-shell overflow-hidden rounded-2xl border border-slate-200 shadow-card dark:border-slate-800 dark:shadow-none">
      <Table
        data={pageRows as any}
        rowKey={rowKey as any}
        height={options.autoHeight ? undefined : options.height || 520}
        autoHeight={options.autoHeight}
        minHeight={options.minHeight > 0 ? options.minHeight : undefined}
        maxHeight={options.maxHeight > 0 ? options.maxHeight : undefined}
        hover={options.hover}
        bordered={options.bordered}
        cellBordered={options.cellBordered}
        loading={options.loading}
        headerHeight={HEADER_HEIGHT[options.density]}
        rowHeight={ROW_HEIGHT[options.density]}
        wordWrap={options.wordWrap}
        expandedRowKeys={hasExpansion ? expandedIds : undefined}
        onExpandChange={
          hasExpansion
            ? (expanded, rowData: T) => {
                const id = rowKey(rowData);
                setExpandedIds((prev) =>
                  expanded
                    ? Array.from(new Set([...prev, id]))
                    : prev.filter((x) => x !== id),
                );
              }
            : undefined
        }
        renderRowExpanded={
          hasExpansion
            ? (rowData?: T) => (rowData ? renderExpanded(rowData) : null)
            : undefined
        }
        rowExpandedHeight={expandedRowHeight}
        locale={{
          emptyMessage: locale?.emptyMessage ?? "검색 결과가 없습니다",
          loading: locale?.loading ?? "불러오는 중…",
        }}
      >
        {columns.map((col) => (
          <Table.Column
            key={col.key}
            width={col.width}
            flexGrow={col.flexGrow}
            minWidth={col.minWidth}
            align={col.align}
            sortable={col.sortable ?? options.sortable}
            resizable={col.resizable ?? options.resizable}
            fullText={col.fullText ?? options.fullText}
          >
            <Table.HeaderCell>{col.header}</Table.HeaderCell>
            <Table.Cell>
              {(row: T) => {
                const id = rowKey(row);
                return col.cell(row, {
                  isExpanded: expandedIds.includes(id),
                  toggleExpand: () => toggleExpand(id),
                  density: options.density,
                });
              }}
            </Table.Cell>
          </Table.Column>
        ))}
      </Table>

      {bottomBar ? (
        bottomBar({
          total: data.length,
          page,
          rowsInPage: pageRows.length,
          options,
          onPageChange: setPage,
        })
      ) : (
        <DefaultBottomBar
          total={data.length}
          page={page}
          pageSize={options.pageSize}
          paginated={options.paginated}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function DefaultBottomBar({
  total,
  page,
  pageSize,
  paginated,
  onPageChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  paginated: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-3 border-t border-slate-100 bg-slate-50/60 text-[12px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
      <span>
        총 <strong className="text-slate-900 dark:text-slate-300">{total}</strong>명
        {paginated && (
          <>
            {" "}· {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} 표시
          </>
        )}
      </span>
      {paginated && total > pageSize && (
        <Pagination
          prev
          next
          first
          last
          total={total}
          limit={pageSize}
          activePage={page}
          onChangePage={onPageChange}
          maxButtons={5}
          size="sm"
        />
      )}
    </div>
  );
}
