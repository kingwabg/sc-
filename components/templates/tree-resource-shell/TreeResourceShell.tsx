"use client";

/**
 * TreeResourceShell — 도메인 무관 계층형 그룹 사이드바
 *
 * ChildrenSidebar에서 추출. dnd-kit 기반 그룹 트리 + 인라인 편집 +
 * 호버 액션 메뉴 + 시스템 노드 보호 포함.
 *
 * 책임:
 *  - 그룹 트리 렌더링 (재귀, depth 기반 들여쓰기)
 *  - 그룹 CRUD UI (이름 편집/추가/삭제)
 *  - 드래그&드롭으로 그룹 이동 (계층 변경)
 *  - 펼침/접힘 상태
 *  - 호버 시 행 내부 액션 메뉴
 *
 * 책임 아님 (외부):
 *  - 그룹 데이터 정의/저장 (페이지에서 도메인 store로)
 *  - 도메인별 액션 (필터 옵션 드로어 등) — onOpenOptions 콜백으로 위임
 */

import { useState, useRef, useEffect, useMemo, forwardRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Users,
  Plus,
  Folder,
  FolderOpen,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  GripVertical,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Public types ──────────────────────────────────────────────

export type TreeShellGroupMeta = {
  /** 시스템 노드 (예: "all") — CRUD/드래그 불가 */
  isSystem?: boolean;
  /** 필터 조건이 있으면 인디케이터 점 표시 */
  hasFilter?: boolean;
  /** 도메인별 추가 배지 */
  badge?: React.ReactNode;
};

export type TreeShellGroup = {
  id: string;
  label: string;
  parentId: string | null;
  /** 같은 부모 안에서의 정렬 */
  order: number;
  meta?: TreeShellGroupMeta;
};

export type TreeResourceShellProps = {
  groups: TreeShellGroup[];
  selectedId: string;
  counts: Record<string, number>;

  title: string;
  /** 사이드바 헤더 아이콘. 기본: Users */
  headerIcon?: React.ReactNode;
  /** 최상단 추가 버튼 라벨. 기본: "폴더 추가" */
  addRootLabel?: string;
  /** 하단 합계 라벨. 예: "총 아동" / "총 종사자" */
  totalLabel?: string;
  /** 합계 표시 라벨 옆 단위. 예: "명" */
  totalUnit?: string;

  onSelect: (id: string) => void;

  // CRUD — 미지정 시 해당 기능 비활성
  onAdd?: (label: string, parentId: string | null) => void;
  onUpdate?: (id: string, label: string) => void;
  onDelete?: (id: string) => { ok: boolean; reason?: string };
  onMove?: (id: string, newParentId: string | null) => { ok: boolean; reason?: string };

  // 도메인별 추가 액션 — 미지정 시 액션 버튼 숨김
  onOpenOptions?: (id: string) => void;

  // 도메인별 카운트 렌더링 (기본: 숫자만)
  renderCount?: (group: TreeShellGroup, count: number) => React.ReactNode;

  // 삭제 전 confirm 메시지 (기본: `"<label>" 폴더를 삭제할까요?`)
  confirmDelete?: (group: TreeShellGroup) => boolean;

  // 추가 인풋 placeholder (기본: "폴더 이름")
  addPlaceholder?: string;

  // 최상위 "추가" 버튼 노출 여부. false면 버튼만 숨김 (드롭존은 유지 → 최상위 이동 가능)
  showRootAdd?: boolean;

  // 헤더 우측에 렌더링할 추가 액션 (예: 종사자 등록 버튼)
  headerAction?: React.ReactNode;
};

// ─── Constants ─────────────────────────────────────────────────

const ROOT_DROPPABLE_ID = "__ROOT__";

// ─── Component ─────────────────────────────────────────────────

export function TreeResourceShell({
  groups,
  selectedId,
  counts,
  title,
  headerIcon,
  addRootLabel = "폴더 추가",
  totalLabel = "총",
  totalUnit = "명",
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
  onOpenOptions,
  renderCount,
  confirmDelete,
  addPlaceholder = "폴더 이름",
  showRootAdd = true,
  headerAction,
}: TreeResourceShellProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingParent, setAddingParent] = useState<string | null>(null);
  const [addingDepth, setAddingDepth] = useState(0);
  const [newLabel, setNewLabel] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const editRef = useRef<HTMLInputElement | null>(null);
  const addRef = useRef<HTMLInputElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const { roots, childrenOf } = useMemo(() => {
    const sorted = [...groups].sort((a, b) => a.order - b.order);
    return {
      roots: sorted.filter((g) => g.parentId === null),
      childrenOf: (parentId: string) =>
        sorted.filter((g) => g.parentId === parentId),
    };
  }, [groups]);

  // ── Expand ──
  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Edit ──
  function startEdit(g: TreeShellGroup) {
    if (g.meta?.isSystem) return;
    setEditingId(g.id);
    setEditLabel(g.label);
    setTimeout(() => editRef.current?.focus(), 0);
  }

  function saveEdit() {
    if (!editingId) return;
    const t = editLabel.trim();
    if (!t) {
      setEditingId(null);
      return;
    }
    onUpdate?.(editingId, t);
    setEditingId(null);
  }

  function handleEditKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") setEditingId(null);
  }

  // ── Add ──
  function startAdd(parentId: string | null, depth: number) {
    if (!onAdd) return;
    setAddingParent(parentId ?? "__root__");
    setAddingDepth(depth);
    setNewLabel("");
    setTimeout(() => addRef.current?.focus(), 0);
  }

  function saveAdd() {
    const t = newLabel.trim();
    if (!t) {
      setAddingParent(null);
      return;
    }
    const pid = addingParent === "__root__" ? null : addingParent;
    onAdd?.(t, pid);
    setAddingParent(null);
    setNewLabel("");
  }

  function handleAddKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveAdd();
    if (e.key === "Escape") {
      setAddingParent(null);
      setNewLabel("");
    }
  }

  // ── Delete ──
  function handleDelete(g: TreeShellGroup) {
    if (!onDelete) return;
    if (confirmDelete) {
      if (!confirmDelete(g)) return;
    } else if (!window.confirm(`"${g.label}" 폴더를 삭제할까요?`)) {
      return;
    }
    const result = onDelete(g.id);
    if (result && !result.ok) {
      window.alert(result.reason ?? "삭제할 수 없습니다.");
    }
  }

  // ── dnd-kit handlers ──
  function isInvalidTarget(targetId: string | null, sourceId: string): boolean {
    if (targetId == null) return false;
    if (targetId === sourceId) return true;
    const walk = (pid: string): string[] => {
      const kids = childrenOf(pid);
      return kids.flatMap((k) => [k.id, ...walk(k.id)]);
    };
    return walk(sourceId).includes(targetId);
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveDragId(String(e.active.id));
  }

  function handleDragOver(e: DragOverEvent) {
    setOverId(e.over ? String(e.over.id) : null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const sourceId = String(e.active.id);
    const overIdRaw = e.over ? String(e.over.id) : null;
    setActiveDragId(null);
    setOverId(null);
    if (!overIdRaw) return;
    const targetId = overIdRaw === ROOT_DROPPABLE_ID ? null : overIdRaw;
    if (isInvalidTarget(targetId, sourceId)) return;
    if (!onMove) return;
    const result = onMove(sourceId, targetId);
    if (result && !result.ok) {
      window.alert(result.reason ?? "이동할 수 없습니다.");
      return;
    }
    if (targetId != null && !expanded.has(targetId)) {
      setExpanded((prev) => new Set([...prev, targetId]));
    }
  }

  function handleDragCancel() {
    setActiveDragId(null);
    setOverId(null);
  }

  const activeGroup = activeDragId
    ? groups.find((g) => g.id === activeDragId) ?? null
    : null;

  const canAdd = !!onAdd;

  return (
    <DndContext
      id="tree-resource-shell"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {headerIcon ?? <Users className="w-4 h-4 text-brand-600" />}
            <h2 className="text-[13px] font-bold text-slate-900 m-0">{title}</h2>
          </div>
          {headerAction}
        </div>

        {/* Folder tree */}
        <div className="px-2 py-2 flex-1 overflow-y-auto">
          {/* ROOT drop zone + add button */}
          {canAdd && (
            <RootDropZone
              isDragging={!!activeDragId}
              isOver={overId === ROOT_DROPPABLE_ID}
            >
              {showRootAdd && addingParent === null && activeDragId === null && (
                <button
                  onClick={() => startAdd(null, 0)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[12px] text-slate-400 hover:bg-brand-50 hover:text-brand-600 rounded transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addRootLabel}
                </button>
              )}
              {!showRootAdd && addingParent === null && activeDragId === null && canAdd && (
                <span className="text-[11px] text-slate-300 text-center">
                  (드래그해서 그룹 간 이동)
                </span>
              )}
              {addingParent === null && activeDragId !== null && (
                <span className="text-[11px] text-slate-500">
                  여기에 놓으면 최상위로 이동
                </span>
              )}
            </RootDropZone>
          )}

          {/* Top-level add form */}
          {addingParent === "__root__" && (
            <AddRow
              ref={addRef}
              value={newLabel}
              onChange={setNewLabel}
              onKeyDown={handleAddKey}
              onSave={saveAdd}
              onCancel={() => setAddingParent(null)}
              placeholder={addPlaceholder}
              depth={0}
            />
          )}

          {roots.map((g) => renderGroup(g))}

          {/* Sub-folder add form */}
          {addingParent !== null && addingParent !== "__root__" && (
            <AddRow
              ref={addRef}
              value={newLabel}
              onChange={setNewLabel}
              onKeyDown={handleAddKey}
              onSave={saveAdd}
              onCancel={() => {
                setAddingParent(null);
                setNewLabel("");
              }}
              placeholder={addPlaceholder}
              depth={addingDepth + 1}
            />
          )}
        </div>

        {/* Total footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-500 font-medium">{totalLabel}</span>
            <span className="font-bold text-slate-900">
              {counts["all"] ?? 0}
              {totalUnit}
            </span>
          </div>
        </div>
      </aside>

      {/* Drag preview */}
      <DragOverlay>
        {activeGroup ? (
          <div className="bg-white border-2 border-brand-500 rounded-md shadow-xl px-3 py-2 flex items-center gap-2 text-[13px] text-brand-700 font-semibold opacity-90">
            <FolderOpen className="w-4 h-4" />
            {activeGroup.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  // Recursive render
  function renderGroup(g: TreeShellGroup, depth = 0): React.ReactNode {
    const subs = childrenOf(g.id);
    const hasSubs = subs.length > 0;
    const isOpen = expanded.has(g.id);
    const isActive = g.id === selectedId;
    const isEditing = editingId === g.id;
    const isAdding = addingParent === g.id;

    return (
      <div key={g.id}>
        <FolderRow
          g={g}
          depth={depth}
          hasSubs={hasSubs}
          isOpen={isOpen}
          isActive={isActive}
          isEditing={isEditing}
          isAdding={isAdding}
          counts={counts}
          toggleExpand={toggleExpand}
          startEdit={startEdit}
          startAdd={startAdd}
          handleDelete={handleDelete}
          editRef={editRef}
          editLabel={editLabel}
          setEditLabel={setEditLabel}
          saveEdit={saveEdit}
          handleEditKey={handleEditKey}
          setEditingId={setEditingId}
          selectedId={selectedId}
          onSelect={onSelect}
          onOpenOptions={onOpenOptions}
          activeDragId={activeDragId}
          overId={overId}
          renderCount={renderCount}
        />

        {/* Add sub-folder form */}
        {isAdding && (
          <AddRow
            ref={addRef}
            value={newLabel}
            onChange={setNewLabel}
            onKeyDown={handleAddKey}
            onSave={saveAdd}
            onCancel={() => {
              setAddingParent(null);
              setNewLabel("");
            }}
            placeholder={addPlaceholder}
            depth={depth + 1}
          />
        )}

        {/* Sub-folders */}
        {hasSubs && isOpen && subs.map((sub) => renderGroup(sub, depth + 1))}
      </div>
    );
  }
}

// ─── AddRow (inline add form) ──────────────────────────────────

type AddRowProps = {
  value: string;
  onChange: (s: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder: string;
  depth: number;
};

const AddRow = forwardRef<HTMLInputElement, AddRowProps>(
  ({ value, onChange, onKeyDown, onSave, onCancel, placeholder, depth }, ref) => (
    <div
      className="grid w-full min-w-0 grid-cols-[16px_minmax(0,1fr)_24px_24px] items-center gap-1 pr-1 py-1"
      style={{ paddingLeft: Math.min(depth, 4) * 14 + 20 }}
    >
      <Folder className="w-4 h-4 text-slate-300 shrink-0" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="min-w-0 px-2 py-1 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
      />
      <button
        onClick={onSave}
        className="w-6 h-6 shrink-0 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700"
      >
        <Check className="w-3 h-3" />
      </button>
      <button
        onClick={onCancel}
        className="w-6 h-6 shrink-0 rounded grid place-items-center text-slate-400 hover:bg-slate-100"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  ),
);
AddRow.displayName = "AddRow";

// ─── Root drop zone ─────────────────────────────────────────────

function RootDropZone({
  isDragging,
  isOver,
  children,
}: {
  isDragging: boolean;
  isOver: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: ROOT_DROPPABLE_ID });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition border-2 border-dashed rounded-md mb-1 px-2 py-1.5 min-h-[28px] flex items-center justify-center",
        isDragging && isOver && "border-brand-400 bg-brand-50",
        isDragging && !isOver && "border-transparent",
        !isDragging && "border-transparent",
      )}
    >
      {children}
    </div>
  );
}

// ─── Folder row with drag handle ──────────────────────────────

function FolderRow({
  g,
  depth,
  hasSubs,
  isOpen,
  isActive,
  isEditing,
  isAdding,
  counts,
  toggleExpand,
  startEdit,
  startAdd,
  handleDelete,
  editRef,
  editLabel,
  setEditLabel,
  saveEdit,
  handleEditKey,
  setEditingId,
  selectedId,
  onSelect,
  onOpenOptions,
  activeDragId,
  overId,
  renderCount,
}: {
  g: TreeShellGroup;
  depth: number;
  hasSubs: boolean;
  isOpen: boolean;
  isActive: boolean;
  isEditing: boolean;
  isAdding: boolean;
  counts: Record<string, number>;
  toggleExpand: (id: string) => void;
  startEdit: (g: TreeShellGroup) => void;
  startAdd: (parentId: string | null, depth: number) => void;
  handleDelete: (g: TreeShellGroup) => void;
  editRef: React.MutableRefObject<HTMLInputElement | null>;
  editLabel: string;
  setEditLabel: (s: string) => void;
  saveEdit: () => void;
  handleEditKey: (e: React.KeyboardEvent) => void;
  setEditingId: (id: string | null) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenOptions?: (id: string) => void;
  activeDragId: string | null;
  overId: string | null;
  renderCount?: (group: TreeShellGroup, count: number) => React.ReactNode;
}) {
  const isSystem = !!g.meta?.isSystem;
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: g.id,
    disabled: isSystem,
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: g.id,
    disabled: isSystem || isEditing,
  });

  const rowRef = useRef<HTMLDivElement | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  const isThisOver = isOver || overId === g.id;
  const count = counts[g.id] ?? 0;

  return (
    <div
      ref={(node) => {
        rowRef.current = node;
        setDropRef(node);
      }}
      className={cn(
        "group relative flex w-full min-w-0 items-center rounded-md transition",
        isDragging && "opacity-30",
        activeDragId && isThisOver && activeDragId !== g.id && "ring-2 ring-brand-400 bg-brand-50",
      )}
      style={{ paddingLeft: depth * 16 }}
      onMouseLeave={() => setActionsOpen(false)}
    >
      {/* Expand toggle */}
      <button
        onClick={() => toggleExpand(g.id)}
        className={cn(
          "w-5 h-5 grid place-items-center rounded shrink-0 transition",
          hasSubs ? "text-slate-400 hover:bg-slate-100" : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronRight className={cn("w-3 h-3 transition", isOpen && "rotate-90")} />
      </button>

      {/* Drag handle (시스템 노드 제외) */}
      {!isSystem && (
        <span
          ref={setDragRef}
          {...listeners}
          {...attributes}
          className="w-4 h-5 grid place-items-center text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing select-none shrink-0 touch-none"
          title="드래그해서 이동"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </span>
      )}

      {isEditing ? (
        /* Inline edit */
        <div className="flex-1 min-w-0 flex items-center gap-1">
          <Folder className="w-4 h-4 text-slate-300 shrink-0" />
          <input
            ref={editRef}
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={handleEditKey}
            className="flex-1 min-w-0 px-1.5 py-0.5 text-[12px] border border-brand-300 rounded outline-none focus:border-brand-500 bg-white"
          />
          <button
            onClick={saveEdit}
            className="w-5 h-5 shrink-0 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="w-5 h-5 shrink-0 rounded grid place-items-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              setActionsOpen(false);
              onSelect(g.id);
            }}
            className={cn(
              "flex-1 flex items-center gap-1.5 px-1.5 py-1.5 rounded-md transition text-[13px] min-w-0",
              isActive
                ? "bg-brand-50 text-brand-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {isActive ? (
              <FolderOpen className="w-4 h-4 shrink-0 text-brand-500" />
            ) : (
              <Folder className="w-4 h-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate flex-1">{g.label}</span>
            {g.meta?.hasFilter && (
              <span
                title="스마트 폴더 (필터 조건 적용됨)"
                className="w-2 h-2 rounded-full bg-violet-500 shrink-0"
              />
            )}
            {!isSystem && (
              <span
                className={cn(
                  "text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 transition-opacity group-hover:opacity-0",
                  isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500",
                )}
              >
                {renderCount ? renderCount(g, count) : count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setActionsOpen((open) => !open);
            }}
            className="pointer-events-none absolute right-0.5 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 opacity-0 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 group-hover:pointer-events-auto group-hover:opacity-100"
            aria-label="폴더 작업 열기"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Click actions — 시스템 노드에도 옵션은 노출 가능 */}
          {actionsOpen && (
            <div className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 rounded-md bg-white px-0.5 py-0.5 shadow-sm ring-1 ring-slate-200">
              {/* 하위 폴더 추가 — 시스템 노드에도 노출 (depth 0에 추가 가능) */}
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setActionsOpen(false);
                  startAdd(g.id, depth + 1);
                }}
                className="w-6 h-6 grid place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                aria-label="하위 폴더 추가"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {onOpenOptions && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setActionsOpen(false);
                    onOpenOptions(g.id);
                  }}
                  className={cn(
                    "w-6 h-6 grid place-items-center rounded hover:bg-slate-100 hover:text-brand-600",
                    g.meta?.hasFilter ? "text-brand-600" : "text-slate-500",
                  )}
                  aria-label="폴더 조건"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              )}
              {!isSystem && (
                <>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setActionsOpen(false);
                      startEdit(g);
                    }}
                    className="w-6 h-6 grid place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                    aria-label="이름 수정"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setActionsOpen(false);
                      handleDelete(g);
                    }}
                    className="w-6 h-6 grid place-items-center rounded text-slate-500 hover:bg-red-50 hover:text-red-500"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 위에서 forwardRef 안 쓴 채로 작성한 부분에 대한 re-export (호환성)
// (AddRow는 TreeResourceShell 내부 전용 — 외부 export 불필요)
