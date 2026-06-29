"use client";

import { useState, useRef } from "react";
import { Users, Plus, Folder, FolderOpen, ChevronRight, Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
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
};

export function ChildrenSidebar({
  selectedGroupId,
  groups,
  counts,
  onSelectGroup,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveGroup,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingParent, setAddingParent] = useState<string | null>(null);
  // "__root__" = 상위 폴더 추가 중 (null이면 아무것도 안 함)
  const [addingDepth, setAddingDepth] = useState(0);
  const [newLabel, setNewLabel] = useState("");
  // ── Drag state ─────────────────────────────────
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null); // "ROOT" = 상위로
  const [dragInvalid, setDragInvalid] = useState(false);
  const editRef = useRef<HTMLInputElement | null>(null);
  const addRef = useRef<HTMLInputElement | null>(null);

  // Build tree
  const roots = groups.filter((g) => g.parentId === null).sort((a, b) => a.order - b.order);
  const childrenOf = (parentId: string) => groups.filter((g) => g.parentId === parentId).sort((a, b) => a.order - b.order);

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

  // ── Drag and drop ──────────────────────────────────────
  function isInvalidTarget(targetId: string | null, sourceId: string): boolean {
    if (targetId === null) return false; // ROOT 는 항상 가능
    if (targetId === sourceId) return true; // 자기 자신
    // source의 하위인지 확인
    const childrenOf = (parentId: string): string[] => groups.filter((g) => g.parentId === parentId).flatMap((g) => [g.id, ...childrenOf(g.id)]);
    return childrenOf(sourceId).includes(targetId);
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, targetId: string | null) {
    if (!draggingId) return;
    e.preventDefault();
    if (isInvalidTarget(targetId, draggingId)) {
      e.dataTransfer.dropEffect = "none";
      setDragInvalid(true);
      setDragOverId(targetId);
    } else {
      e.dataTransfer.dropEffect = "move";
      setDragInvalid(false);
      setDragOverId(targetId);
    }
  }

  function handleDragLeave() {
    setDragOverId(null);
    setDragInvalid(false);
  }

  function handleDrop(e: React.DragEvent, targetId: string | null) {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setDragOverId(null);
    setDragInvalid(false);
    if (!sourceId) return;
    if (isInvalidTarget(targetId, sourceId)) return;
    onMoveGroup(sourceId, targetId);
    // 이동된 폴더의 상위가 펼쳐져 있어야 보임
    if (targetId != null && !expanded.has(targetId)) {
      setExpanded((prev) => new Set([...prev, targetId]));
    }
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
    setDragInvalid(false);
  }

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-2">
        <Users className="w-4 h-4 text-brand-600" />
        <h2 className="text-[13px] font-bold text-slate-900 m-0">아동 관리</h2>
      </div>

      {/* Folder tree */}
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        {/* ROOT drop zone (상위로 이동) */}
        <div
          onDragOver={(e) => handleDragOver(e, null)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null)}
          className={cn(
            "transition border-2 border-dashed rounded-md mb-1 px-2 py-1.5 text-[12px] flex items-center justify-center gap-1.5",
            dragOverId === null && draggingId
              ? dragInvalid
                ? "border-red-300 bg-red-50 text-red-500"
                : "border-brand-400 bg-brand-50 text-brand-700 font-semibold"
              : "border-transparent",
          )}
        >
          {addingParent === null && draggingId === null ? (
            <>
              <button
                onClick={() => startAdd(null, 0)}
                className="w-full flex items-center gap-1.5 text-slate-400 hover:text-brand-600 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                폴더 추가
              </button>
              {/* ROOT drop 안내 */}
              {draggingId && (
                <span className="text-[10px] text-slate-400">여기에 놓으면 최상위로 이동</span>
              )}
            </>
          ) : addingParent === null ? null : null}
          {addingParent === "__root__" && null}
        </div>

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
          <div className="flex items-center gap-1.5 pr-2 py-1"
            style={{ paddingLeft: (addingDepth + 1) * 16 + 20 }}>
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
  );

  // Recursive render
  function renderGroup(g: ChildGroup, depth = 0): React.ReactNode {
    const subs = childrenOf(g.id);
    const hasSubs = subs.length > 0;
    const isOpen = expanded.has(g.id);
    const isActive = g.id === selectedGroupId;
    const isEditing = editingId === g.id;
    const isAdding = addingParent === g.id;
    const isDragging = draggingId === g.id;
    const isDragOver = dragOverId === g.id && draggingId != null;
    const isInvalidDrop = isDragOver && dragInvalid;

    return (
      <div key={g.id}>
        <div
          onDragOver={(e) => handleDragOver(e, g.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, g.id)}
          className={cn(
            "group relative flex items-center rounded-md transition",
            isDragging && "opacity-40",
            isInvalidDrop && "ring-2 ring-red-400 bg-red-50",
            !isInvalidDrop && isDragOver && "ring-2 ring-brand-400 bg-brand-50",
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
              draggable
              onDragStart={(e) => handleDragStart(e, g.id)}
              onDragEnd={handleDragEnd}
              className="w-4 h-5 grid place-items-center text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing select-none shrink-0"
              title="드래그해서 이동"
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
                  "flex-1 flex items-center gap-1.5 px-1.5 py-1.5 rounded-md transition text-[13px]",
                  isActive ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {isActive ? <FolderOpen className="w-4 h-4 shrink-0 text-brand-500" /> : <Folder className="w-4 h-4 shrink-0 text-slate-400" />}
                <span className="truncate flex-1">{g.label}</span>
                {g.id !== "all" && (
                  <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                    isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {counts[g.id] ?? 0}
                  </span>
                )}
              </button>

              {/* Actions */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-white border border-slate-200 rounded-md shadow-sm px-0.5">
                <button onClick={() => startAdd(g.id, depth + 1)} className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="하위 폴더 추가">
                  <Plus className="w-3 h-3" />
                </button>
                {g.id !== "all" && (
                  <>
                    <button onClick={() => startEdit(g)} className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="이름 수정">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(g.id, g.label)} className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500" title="삭제">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add sub-folder form */}
        {isAdding && (
          <div className="flex items-center gap-1.5 pl-6 pr-2 py-1" style={{ paddingLeft: (depth + 1) * 16 + 20 }}>
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
