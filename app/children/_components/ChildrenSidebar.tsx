"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Plus, Folder, FolderOpen, Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChildGroup } from "@/lib/features/children/types";

type Props = {
  selectedGroupId: string;
  groups: ChildGroup[];
  counts: Record<string, number>;
  onSelectGroup: (id: string) => void;
  onAddGroup: (label: string, capacity: number) => void;
  onUpdateGroup: (id: string, label: string, capacity: number) => void;
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
  const [editCapacity, setEditCapacity] = useState(30);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLabel, setAddLabel] = useState("");
  const [addCapacity, setAddCapacity] = useState(30);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const addInputRef = useRef<HTMLInputElement | null>(null);

  // Start editing a group
  function startEdit(g: ChildGroup) {
    setEditingId(g.id);
    setEditLabel(g.label);
    setEditCapacity(g.capacity);
    setTimeout(() => editInputRef.current?.focus(), 0);
  }

  function saveEdit() {
    if (!editingId) return;
    const trimmed = editLabel.trim();
    if (!trimmed) { cancelEdit(); return; }
    onUpdateGroup(editingId, trimmed, editCapacity);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleEditKey(e: React.KeyboardEvent, save: () => void) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancelEdit();
  }

  // Add new group
  function handleAdd() {
    const trimmed = addLabel.trim();
    if (!trimmed) return;
    onAddGroup(trimmed, addCapacity);
    setAddLabel("");
    setAddCapacity(30);
    setShowAddForm(false);
  }

  function handleAddKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") { setShowAddForm(false); setAddLabel(""); }
  }

  // Delete with confirmation (inline)
  function handleDelete(id: string, label: string) {
    if (!window.confirm(`"${label}" 그룹을 삭제할까요?`)) return;
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

      {/* Group list */}
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            정원 그룹
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setTimeout(() => addInputRef.current?.focus(), 0);
            }}
            className="w-5 h-5 rounded grid place-items-center text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition"
            title="그룹 추가"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="mb-2 p-2 bg-brand-50 rounded-lg border border-brand-200 space-y-1.5">
            <input
              ref={addInputRef}
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              onKeyDown={handleAddKey}
              placeholder="그룹 이름 (예: 35명 그룹)"
              className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
            />
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">정원</span>
              <input
                type="number"
                value={addCapacity}
                onChange={(e) => setAddCapacity(Number(e.target.value))}
                className="w-14 px-2 py-1 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500"
                min={1}
                max={999}
              />
              <span className="text-[11px] text-slate-500">명</span>
              <div className="flex-1" />
              <button
                onClick={handleAdd}
                className="w-6 h-6 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700 transition"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddLabel(""); }}
                className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {groups.map((g) => {
          const isActive = g.id === selectedGroupId;
          const isEditing = editingId === g.id;
          const isAll = g.id === "all";
          const count = counts[g.id] ?? counts.all ?? 0;

          return (
            <div key={g.id} className="group relative flex items-center mb-0.5">
              {isEditing ? (
                /* Inline edit form */
                <div className="flex-1 flex items-center gap-1 px-1 py-1 bg-brand-50 rounded-md border border-brand-200">
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <input
                    ref={editInputRef}
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => handleEditKey(e, saveEdit)}
                    className="flex-1 px-1.5 py-1 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500 bg-white min-w-0"
                  />
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-14 px-1.5 py-1 text-[12px] border border-slate-200 rounded-md outline-none focus:border-brand-500 bg-white"
                    min={1}
                    max={999}
                  />
                  <button
                    onClick={saveEdit}
                    className="w-6 h-6 rounded grid place-items-center bg-brand-600 text-white hover:bg-brand-700 shrink-0"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:bg-slate-100 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                /* Normal button */
                <button
                  onClick={() => onSelectGroup(g.id)}
                  className={cn(
                    "w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg transition",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {isActive ? (
                    <FolderOpen className="w-4 h-4 shrink-0 text-brand-500" />
                  ) : (
                    <Folder className="w-4 h-4 shrink-0 text-slate-400" />
                  )}
                  <span className="text-[13px] font-medium flex-1 truncate">{g.label}</span>
                  <span
                    className={cn(
                      "text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                      isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {count}
                  </span>
                </button>
              )}

              {/* Action buttons — shown on hover (except for "all") */}
              {!isEditing && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(g); }}
                    className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition"
                    title="그룹 수정"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {!isAll && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(g.id, g.label); }}
                      className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                      title="그룹 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-slate-500 font-medium">총 아동</span>
          <span className="font-bold text-slate-900">{counts.all ?? 0}명</span>
        </div>
      </div>
    </aside>
  );
}
