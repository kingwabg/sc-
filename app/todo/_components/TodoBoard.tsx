"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  ClipboardList,
  Flame,
  GripVertical,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodos as getSidebarTodos } from "@/lib/features/sidebar-todo";

type TodoStatus = "todo" | "doing" | "done";
type TodoPriority = "low" | "normal" | "high";

type BoardTask = {
  id: string;
  title: string;
  note: string;
  status: TodoStatus;
  priority: TodoPriority;
  due: string;
  createdAt: string;
};

const STORAGE_KEY = "office.todo-board.v1";

const COLUMNS: Array<{
  id: TodoStatus;
  title: string;
  description: string;
  icon: typeof Circle;
  accent: string;
  surface: string;
  over: string;
  count: string;
}> = [
  {
    id: "todo",
    title: "대기",
    description: "해야 할 일",
    icon: Circle,
    accent: "bg-[#0f172a] text-white dark:bg-[#334155] dark:text-slate-100",
    surface: "border-slate-200 bg-[#f1f5f9]/70 dark:border-slate-700/80 dark:bg-[#0b1220]/70",
    over: "border-slate-400 bg-[#e2e8f0]/80 dark:border-slate-500 dark:bg-[#1e293b]/85",
    count: "bg-[#0f172a] text-white dark:bg-[#334155]",
  },
  {
    id: "doing",
    title: "진행",
    description: "오늘 처리 중",
    icon: Flame,
    accent: "bg-blue-100 text-blue-700",
    surface: "border-blue-100 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/25",
    over: "border-blue-300 bg-blue-100/80 dark:border-blue-700 dark:bg-blue-950/45",
    count: "bg-blue-950 text-white dark:bg-blue-500",
  },
  {
    id: "done",
    title: "완료",
    description: "마무리됨",
    icon: CheckCircle2,
    accent: "bg-emerald-100 text-emerald-700",
    surface: "border-emerald-100 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/25",
    over: "border-emerald-300 bg-emerald-100/80 dark:border-emerald-700 dark:bg-emerald-950/45",
    count: "bg-emerald-950 text-white dark:bg-emerald-500",
  },
];

const PRIORITY_META: Record<TodoPriority, { label: string; className: string }> = {
  low: { label: "낮음", className: "bg-slate-100 text-slate-600" },
  normal: { label: "보통", className: "bg-blue-50 text-blue-700" },
  high: { label: "중요", className: "bg-rose-50 text-rose-700" },
};

const seedTasks: BoardTask[] = [
  {
    id: "task-inbox",
    title: "오늘 결재함 확인",
    note: "대기 문서와 긴급 요청을 먼저 훑어보기",
    status: "todo",
    priority: "high",
    due: "오늘",
    createdAt: "seed",
  },
  {
    id: "task-call",
    title: "보호자 연락 메모 정리",
    note: "오후 상담 전 누락된 연락 기록 확인",
    status: "doing",
    priority: "normal",
    due: "오후",
    createdAt: "seed",
  },
  {
    id: "task-report",
    title: "주간 프로그램 점검",
    note: "일지 작성 상태와 출석 누락 확인",
    status: "done",
    priority: "low",
    due: "이번 주",
    createdAt: "seed",
  },
];

function readBoardTasks(): BoardTask[] {
  if (typeof window === "undefined") return seedTasks;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore invalid localStorage and fall back to migration/default data.
  }

  const sidebarTodos = getSidebarTodos();
  if (sidebarTodos.length > 0) {
    return sidebarTodos.map((item, index) => ({
      id: item.id,
      title: item.text,
      note: "",
      status: item.done ? "done" : "todo",
      priority: "normal",
      due: index === 0 ? "오늘" : "",
      createdAt: "migrated",
    }));
  }

  return seedTasks;
}

function saveBoardTasks(tasks: BoardTask[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function TodoBoard() {
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("normal");
  const [due, setDue] = useState("오늘");

  useEffect(() => {
    setTasks(readBoardTasks());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveBoardTasks(tasks);
  }, [loaded, tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const tasksByStatus = useMemo(
    () =>
      COLUMNS.reduce<Record<TodoStatus, BoardTask[]>>(
        (acc, column) => {
          acc[column.id] = tasks.filter((task) => task.status === column.id);
          return acc;
        },
        { todo: [], doing: [], done: [] },
      ),
    [tasks],
  );

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;
  const openCount = tasks.filter((task) => task.status !== "done").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;

  function addTask() {
    const trimmed = title.trim();
    if (!trimmed) return;

    const next: BoardTask = {
      id: crypto.randomUUID(),
      title: trimmed,
      note: "",
      status: "todo",
      priority,
      due: due.trim(),
      createdAt: new Date().toISOString(),
    };

    setTasks((current) => [next, ...current]);
    setTitle("");
    setPriority("normal");
    setDue("오늘");
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function moveTask(id: string, status: TodoStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overId = String(over.id);
    const overTask = tasks.find((task) => task.id === overId);
    const targetStatus = (over.data.current?.status ?? overTask?.status ?? overId) as TodoStatus;

    if (!COLUMNS.some((column) => column.id === targetStatus)) return;

    if (activeTask.status !== targetStatus) {
      setTasks((current) => {
        const withoutActive = current.filter((task) => task.id !== activeTask.id);
        const updated = { ...activeTask, status: targetStatus };
        const overIndex = overTask
          ? withoutActive.findIndex((task) => task.id === overTask.id)
          : -1;

        if (overIndex >= 0) {
          return [
            ...withoutActive.slice(0, overIndex),
            updated,
            ...withoutActive.slice(overIndex),
          ];
        }

        return [...withoutActive, updated];
      });
      return;
    }

    if (!overTask || active.id === over.id) return;

    const activeIndex = tasks.findIndex((task) => task.id === active.id);
    const overIndex = tasks.findIndex((task) => task.id === over.id);
    setTasks((current) => arrayMove(current, activeIndex, overIndex));
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              <ClipboardList className="h-3.5 w-3.5" />
              Drag & Drop Todo
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              오늘 할 일 보드
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              카드를 끌어서 상태를 바꾸고, 같은 컬럼 안에서 우선순위를 정리하세요.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-[260px]">
            <Metric label="진행 전/중" value={openCount} />
            <Metric label="완료" value={doneCount} />
          </div>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_150px_120px_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addTask();
            }}
            placeholder="새 할 일을 입력하세요"
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TodoPriority)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          >
            <option value="normal">보통</option>
            <option value="high">중요</option>
            <option value="low">낮음</option>
          </select>
          <input
            value={due}
            onChange={(event) => setDue(event.target.value)}
            placeholder="기한"
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
          <button
            type="button"
            onClick={addTask}
            disabled={!title.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            추가
          </button>
        </div>
      </section>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {COLUMNS.map((column) => (
            <TodoColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id]}
              onDelete={deleteTask}
              onMove={moveTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TodoCard task={activeTask} dragging onDelete={() => {}} onMove={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid h-[68px] min-w-0 place-items-center rounded-xl border border-slate-200 bg-[#f8fafc] px-3 text-center dark:border-slate-700 dark:bg-[#0b1220]/70">
      <div className="text-2xl font-black text-slate-950">{value}</div>
      <div className="text-[11px] font-bold leading-4 text-slate-500">{label}</div>
    </div>
  );
}

function TodoColumn({
  column,
  tasks,
  onDelete,
  onMove,
}: {
  column: (typeof COLUMNS)[number];
  tasks: BoardTask[];
  onDelete: (id: string) => void;
  onMove: (id: string, status: TodoStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { status: column.id },
  });
  const Icon = column.icon;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "min-h-[420px] rounded-2xl border p-3 transition",
        column.surface,
        isOver && column.over,
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={cn("grid h-9 w-9 place-items-center rounded-xl", column.accent)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950">{column.title}</h2>
            <p className="text-xs font-semibold text-slate-500">{column.description}</p>
          </div>
        </div>
        <span className={cn("rounded-full px-2 py-1 text-xs font-black shadow-sm", column.count)}>
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tasks.map((task) => (
            <TodoCard key={task.id} task={task} onDelete={onDelete} onMove={onMove} />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <div className="mt-4 grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 text-center dark:border-slate-700 dark:bg-slate-950/35">
          <div>
            <ListChecks className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-400">여기로 끌어다 놓기</p>
          </div>
        </div>
      )}
    </section>
  );
}

function TodoCard({
  task,
  dragging = false,
  onDelete,
  onMove,
}: {
  task: BoardTask;
  dragging?: boolean;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TodoStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { status: task.status },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition",
        "hover:border-slate-300 hover:shadow-md",
        (isDragging || dragging) && "opacity-70 shadow-xl ring-2 ring-blue-100",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-0.5 grid h-6 w-6 shrink-0 cursor-grab place-items-center rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
          title="드래그"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "break-words text-sm font-black leading-5 text-slate-950",
              task.status === "done" && "text-slate-400 line-through",
            )}
          >
            {task.title}
          </h3>
          {task.note && (
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{task.note}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-black",
                PRIORITY_META[task.priority].className,
              )}
            >
              {PRIORITY_META[task.priority].label}
            </span>
            {task.due && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                <CalendarClock className="h-3 w-3" />
                {task.due}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          title="삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1">
        {COLUMNS.map((column) => (
          <button
            key={column.id}
            type="button"
            onClick={() => onMove(task.id, column.id)}
            className={cn(
              "h-7 rounded-lg text-[11px] font-black transition",
              task.status === column.id
                ? "bg-slate-950 text-white"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            )}
          >
            {column.title}
          </button>
        ))}
      </div>
    </article>
  );
}
