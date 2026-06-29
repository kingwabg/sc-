"use client";

import { useState, useRef } from "react";
import { Users, Plus, Folder, FolderOpen, ChevronRight, Pencil, Trash2, Check, X } from "lucide-react";
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
  onAddChild: () => void;
};

export function ChildrenSidebar({
  selectedGroupId,
  groups,
  counts,
  onSelectGroup,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddChild,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingParent, setAddingParent] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
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

  function startAdd(parentId: string | null) {
    setAddingParent(parentId);
    setNewLabel("");
    setTimeout(() => addRef.current?.focus(), 0);
  }

  function saveAdd() {
    const t = newLabel.trim();
    if (!t) { setAddingParent(null); return; }
    onAddGroup(t, addingParent);
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

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-600" />
          <h2 className="text-[13px] font-bold text-slate-900 m-0">아동 관리</h2>
        </div>
        <button
          onClick={onAddChild}
          className="w-7 h-7 rounded-lg bg-brand-600 text-white grid place-items-center hover:bg-brand-700 transition shrink-0"
          title="아동 등록"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Folder tree */}
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        {/* Add top-level folder */}
        {addingParent === null && (
          <button
            onClick={() => startAdd(null)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition mb-1"
          >
            <Plus className="w-3.5 h-3.5" />
            폴더 추가
          </button>
        )}

        {/* Add top-level form */}
        {addingParent === null && addingParent === null && null}

        {roots.map((g) => renderGroup(g))}

        {/* Add folder inline form */}
        {addingParent !== null && (
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

    return (
      <div key={g.id}>
        <div className="group relative flex items-center" style={{ paddingLeft: depth * 16 }}>
          {/* Expand toggle */}
          <button
            onClick={() => toggleExpand(g.id)}
            className={cn("w-5 h-5 grid place-items-center rounded shrink-0 transition", hasSubs ? "text-slate-400 hover:bg-slate-100" : "opacity-0 pointer-events-none")}
          >
            <ChevronRight className={cn("w-3 h-3 transition", isOpen && "rotate-90")} />
          </button>

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
                <button onClick={() => startAdd(g.id)} className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="하위 폴더 추가">
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
