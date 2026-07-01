"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodos, saveTodos, reorderTodos, LABELS } from "@/lib/features/sidebar-todo";
import type { TodoItem } from "@/lib/features/sidebar-todo";

// ─── Sortable item ────────────────────────────────────────────
function SortableTodoItem({
  item,
  onToggle,
  onDelete,
}: {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 px-1 py-1 rounded group",
        isDragging && "bg-white shadow-card rounded-lg",
      )}
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 hover:text-slate-500 shrink-0"
        title="드래그하여 순서 변경"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* 체크박스 */}
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)}
        className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
      />

      {/* 텍스트 */}
      <span
        className={cn(
          "flex-1 text-[12.5px] leading-snug",
          item.done ? "text-slate-400 line-through" : "text-slate-700",
        )}
      >
        {item.text}
      </span>

      {/* 삭제 */}
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition shrink-0"
        title={LABELS.delete}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────
export function SidebarTodo() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [open, setOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // localStorage에서 복원
  useEffect(() => {
    setItems(getTodos());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = reorderTodos(items, oldIndex, newIndex);
    setItems(next);
    saveTodos(next);
  };

  const addTodo = () => {
    const text = inputValue.trim();
    if (!text) return;
    const next: TodoItem = {
      id: crypto.randomUUID(),
      text,
      done: false,
      order: items.length,
    };
    const updated = [...items, next];
    setItems(updated);
    saveTodos(updated);
    setInputValue("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    setItems(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveTodos(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTodo();
  };

  const pendingCount = items.filter((i) => !i.done).length;

  return (
    <div className="border-t border-slate-100 px-2 py-2">
      {/* 헤더 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full text-left group"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        <span className="text-[11px] font-semibold tracking-wide text-slate-400 flex-1">
          {LABELS.title}
        </span>
        {pendingCount > 0 && (
          <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </button>

      {/* 접힌 상태이면 아무것도 더 표시 안 함 */}
      {!open && items.length === 0 && null}
      {!open && items.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-1 pl-5">{pendingCount}개 남음</p>
      )}

      {/* 본문 */}
      {open && (
        <div className="mt-2">
          {/* 입력 */}
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={LABELS.addPlaceholder}
              className="flex-1 h-6 px-2 text-[12px] rounded border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 placeholder:text-slate-400"
            />
            <button
              onClick={addTodo}
              disabled={!inputValue.trim()}
              className="w-6 h-6 grid place-items-center rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 목록 */}
          {items.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <SortableTodoItem
                      key={item.id}
                      item={item}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </ul>
          )}

          {items.length === 0 && (
            <p className="text-[11px] text-slate-400 mt-2 text-center">할 일이 없습니다</p>
          )}
        </div>
      )}
    </div>
  );
}
