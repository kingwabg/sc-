"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Users, Plus, Folder, FolderOpen, ChevronRight, Pencil, Trash2, Check, X, GripVertical, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFilterEmpty } from "@/lib/features/children/utils";
import type { ChildGroup } from "@/lib/features/children/types";

type Props = {
  selectedGroupId: string;
  groups: ChildGroup[];
  counts: Record<string, number>;
  onSelectGroup: (id: string) => void;
  onAddGroup: (label: string, parentId: string | null) => void;
  onUpdateGroup: (id: string, label: string) => void;
  onDeleteGroup: (id: string) => void;
  onMoveGroup: (id: string, newParentId: string | null) => { ok: boolean; reason?: string };
  onOpenGroupOptions: (id: string) => void;
};

const ROOT_DROPPABLE_ID = "__ROOT__";

export function ChildrenSidebar({
  selectedGroupId,
  groups,
  counts,
  onSelectGroup,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveGroup,
  onOpenGroupOptions,
}: Props) {
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
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const roots = groups.filter((g) => g.parentId === null).sort((a, b) => a.order - b.order);
  const childrenOf = (parentId: string) =>
    groups.filter((g) => g.parentId === parentId).sort((a, b) => a.order - b.order);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startEdit(g: ChildGroup) {
    setEditingId(g.id);
    setEditLabel(g.label);
    setTimeout(() => editRef.current?.focus(), 0);
  }

  function saveEdit() {
    if (!editingId) return;
    const t = editLabel.trim();
    if (!t) { setEditingId(null); return; }
    onUpdateGroup(editingId, t);
    setEditingId(null);
  }

  function handleEditKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") setEditingId(null);
  }

  function startAdd(parentId: string | null, depth: number) {
    setAddingParent(parentId ?? "__root__");
    setAddingDepth(depth);
    setNewLabel("");
    setTimeout(() => addRef.current?.focus(), 0);
  }

  function saveAdd() {
    const t = newLabel.trim();
    if (!t) { setAddingParent(null); return; }
    const pid = addingParent === "__root__" ? null : addingParent;
    onAddGroup(t, pid);
    setAddingParent(null);
    setNewLabel("");
  }

  function handleAddKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveAdd();
    if (e.key === "Escape") { setAddingParent(null); setNewLabel(""); }
  }

  function handleDelete(id: string, label: string) {
    if (!window.confirm(`"${label}" 폴더를 삭제할까요?`)) return;
    onDeleteGroup(id);
  }

  // ── dnd-kit handlers ────────────────────────────────
  function isInvalidTarget(targetId: string | null, sourceId: string): boolean {
    if (targetId == null) return false;
    if (targetId === sourceId) return true;
    const walk = (pid: string): string[] => {
      const kids = groups.filter((g) => g.parentId === pid);
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
    const overId = e.over ? String(e.over.id) : null;
    setActiveDragId(null);
    setOverId(null);
    if (!overId) return;
    const targetId = overId === ROOT_DROPPABLE_ID ? null : overId;
    if (isInvalidTarget(targetId, sourceId)) return;
    onMoveGroup(sourceId, targetId);
    if (targetId != null && !expanded.has(targetId)) {
      setExpanded((prev) => new Set([...prev, targetId]));
    }
  }

  function handleDragCancel() {
    setActiveDragId(null);
    setOverId(null);
  }

  const activeGroup = activeDragId ? groups.find((g) => g.id === activeDragId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-600" />
          <h2 className="text-[13px] font-bold text-slate-900 m-0">아동 관리</h2>
        </div>

        {/* Folder tree */}
        <div className="px-2 py-2 flex-1 overflow-y-auto">
          {/* ROOT drop zone */}
          <RootDropZone isDragging={!!activeDragId} isOver={overId === ROOT_DROPPABLE_ID}>
            {addingParent === null && activeDragId === null && (
              <button
                onClick={() => startAdd(null, 0)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[12px] text-slate-400 hover:bg-brand-50 hover:text-brand-600 rounded transition"
              >
                <Plus className="w-3.5 h-3.5" />
                폴더 추가
              </button>
            )}
            {addingParent === null && activeDragId !== null && (
              <span className="text-[11px] text-slate-500">여기에 놓으면 최상위로 이동</span>
            )}
          </RootDropZone>

          {/* Top-level add form */}
          {addingParent === "__root__" && (
            <div className="flex items-center gap-1.5 pl-6 pr-2 py-1">
              <Folder className="w-4 h-4 text-slate-300 shrink-0" />
              <input
                ref={addRef}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleAddKey}
                placeholder="폴더 이름"
                className="flex-1 px-2 py-1 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
              />
              <button onClick={saveAdd} className="w-6 h-6 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => setAddingParent(null)} className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:bg-slate-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {roots.map((g) => renderGroup(g))}

          {/* Sub-folder add form */}
          {addingParent !== null && addingParent !== "__root__" && (
            <div
              className="flex items-center gap-1.5 pr-2 py-1"
              style={{ paddingLeft: (addingDepth + 1) * 16 + 20 }}
            >
              <Folder className="w-4 h-4 text-slate-300 shrink-0" />
              <input
                ref={addRef}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleAddKey}
                placeholder="폴더 이름"
                className="flex-1 px-2 py-1 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
              />
              <button onClick={saveAdd} className="w-6 h-6 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => { setAddingParent(null); setNewLabel(""); }} className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:bg-slate-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-500 font-medium">총 아동</span>
            <span className="font-bold text-slate-900">{counts["all"] ?? 0}명</span>
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
  function renderGroup(g: ChildGroup, depth = 0): React.ReactNode {
    const subs = childrenOf(g.id);
    const hasSubs = subs.length > 0;
    const isOpen = expanded.has(g.id);
    const isActive = g.id === selectedGroupId;
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
          selectedGroupId={selectedGroupId}
          onSelectGroup={onSelectGroup}
          onOpenGroupOptions={onOpenGroupOptions}
          activeDragId={activeDragId}
          overId={overId}
          ROOT_DROPPABLE_ID={ROOT_DROPPABLE_ID}
        />

        {/* Add sub-folder form */}
        {isAdding && (
          <div
            className="flex items-center gap-1.5 pl-6 pr-2 py-1"
            style={{ paddingLeft: (depth + 1) * 16 + 20 }}
          >
            <Folder className="w-4 h-4 text-slate-300 shrink-0" />
            <input
              ref={addRef}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleAddKey}
              placeholder="폴더 이름"
              className="flex-1 px-2 py-1 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
            />
            <button onClick={saveAdd} className="w-6 h-6 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => { setAddingParent(null); setNewLabel(""); }} className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:bg-slate-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Sub-folders */}
        {hasSubs && isOpen && subs.map((sub) => renderGroup(sub, depth + 1))}
      </div>
    );
  }
}

// ── Root drop zone ─────────────────────────────────
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

// ── Folder row with drag handle ──────────────────
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
  selectedGroupId,
  onSelectGroup,
  onOpenGroupOptions,
  activeDragId,
  overId,
  ROOT_DROPPABLE_ID,
}: {
  g: ChildGroup;
  depth: number;
  hasSubs: boolean;
  isOpen: boolean;
  isActive: boolean;
  isEditing: boolean;
  isAdding: boolean;
  counts: Record<string, number>;
  toggleExpand: (id: string) => void;
  startEdit: (g: ChildGroup) => void;
  startAdd: (parentId: string | null, depth: number) => void;
  handleDelete: (id: string, label: string) => void;
  editRef: React.MutableRefObject<HTMLInputElement | null>;
  editLabel: string;
  setEditLabel: (s: string) => void;
  saveEdit: () => void;
  handleEditKey: (e: React.KeyboardEvent) => void;
  setEditingId: (id: string | null) => void;
  selectedGroupId: string;
  onSelectGroup: (id: string) => void;
  onOpenGroupOptions: (id: string) => void;
  activeDragId: string | null;
  overId: string | null;
  ROOT_DROPPABLE_ID: string;
}) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: g.id, disabled: g.id === "all" });
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: g.id,
    disabled: g.id === "all" || isEditing,
  });

  const rowRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [portalPos, setPortalPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function updatePortalPos() {
    const el = rowRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPortalPos({ top: r.top + r.height / 2, right: window.innerWidth - r.right });
  }

  useEffect(() => {
    if (hovering) {
      updatePortalPos();
      const onScroll = () => updatePortalPos();
      const onResize = () => updatePortalPos();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
      };
    }
  }, [hovering]);

  const isThisOver = isOver || overId === g.id;
  const invalid = activeDragId != null && activeDragId !== g.id &&
    (() => {
      // 현재 트리 정보는 외부에 없으므로 일단 단순 비교
      return false;
    })();

  return (
    <div
      ref={(node) => { rowRef.current = node; setDropRef(node); }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn(
        "group relative flex items-center rounded-md transition",
        isDragging && "opacity-30",
        activeDragId && isThisOver && activeDragId !== g.id && "ring-2 ring-brand-400 bg-brand-50",
        activeDragId && !isThisOver && g.id !== "all" && "",
      )}
      style={{ paddingLeft: depth * 16 }}
    >
      {/* Expand toggle */}
      <button
        onClick={() => toggleExpand(g.id)}
        className={cn("w-5 h-5 grid place-items-center rounded shrink-0 transition", hasSubs ? "text-slate-400 hover:bg-slate-100" : "opacity-0 pointer-events-none")}
      >
        <ChevronRight className={cn("w-3 h-3 transition", isOpen && "rotate-90")} />
      </button>

      {/* Drag handle (전체 폴더 제외) */}
      {g.id !== "all" && (
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
        <div className="flex-1 flex items-center gap-1">
          <Folder className="w-4 h-4 text-slate-300 shrink-0" />
          <input
            ref={editRef}
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={handleEditKey}
            className="flex-1 px-1.5 py-0.5 text-[12px] border border-brand-300 rounded outline-none focus:border-brand-500 bg-white"
          />
          <button onClick={saveEdit} className="w-5 h-5 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={() => setEditingId(null)} className="w-5 h-5 rounded grid place-items-center text-slate-400 hover:bg-slate-100">
            <X className="w-3 h-3" />
          </button>
        </div>
) : (
        <>
          <button
            onClick={() => onSelectGroup(g.id)}
            className={cn(
              "flex-1 flex items-center gap-1.5 px-1.5 py-1.5 rounded-md transition text-[13px] min-w-0",
              isActive ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {isActive ? <FolderOpen className="w-4 h-4 shrink-0 text-brand-500" /> : <Folder className="w-4 h-4 shrink-0 text-slate-400" />}
            <span className="truncate flex-1">{g.label}</span>
            {!isFilterEmpty(g.filter) && (
              <span title="스마트 폴더 (필터 조건 적용됨)" className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
            )}
            {g.id !== "all" && (
              <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
              )}>
                {counts[g.id] ?? 0}
              </span>
            )}
          </button>

          {/* Actions — portal로 row 우측 바깥에 fixed 위치 (overflow/clip 영향 없음) */}
          {mounted && hovering && portalPos && createPortal(
            <div
              className="fixed z-50 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 bg-white border border-slate-200 rounded-md shadow-xl whitespace-nowrap"
              style={{ top: portalPos.top, right: portalPos.right }}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
            <button onClick={() => startAdd(g.id, depth + 1)} className="w-6 h-6 grid place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="하위 폴더 추가">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenGroupOptions(g.id)}
              className={cn(
                "w-6 h-6 grid place-items-center rounded hover:bg-slate-100 hover:text-brand-600",
                g.filter && !isFilterEmpty(g.filter) ? "text-brand-600" : "text-slate-500",
              )}
              title="폴더 조건 (필터)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            {g.id !== "all" && (
              <>
                <button onClick={() => startEdit(g)} className="w-6 h-6 grid place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="이름 수정">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(g.id, g.label)} className="w-6 h-6 grid place-items-center rounded text-slate-500 hover:bg-red-50 hover:text-red-500" title="삭제">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            </div>,
            document.body,
          )}
        </>
      )}
    </div>
  );
}