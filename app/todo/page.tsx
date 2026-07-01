/**
 * app/todo/page.tsx — 사이드바 Todo (지원 그룹)
 *
 * 기존 SidebarTodo 컴포넌트를 페이지로 노출.
 * AppShell + SidebarTodo (드래그앤드롭 reorder + localStorage ox:sidebar-todos).
 */

import { AppShell } from "@/components/layout/AppShell";
import { SidebarTodo } from "@/components/layout/SidebarTodo";

export default function TodoPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">할 일</h1>
        <p className="text-sm text-slate-500 mb-6">
          드래그앤드롭으로 순서를 바꿀 수 있어요. 항목은 브라우저에 자동 저장됩니다.
        </p>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <SidebarTodo />
        </div>
      </div>
    </AppShell>
  );
}