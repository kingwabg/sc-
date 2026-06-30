"use client";

/**
 * ChildrenSidebar — TreeResourceShell을 사용하는 아동 도메인 어댑터
 *
 * 책임:
 *  - ChildGroup[] → TreeShellGroup[] 매핑 (filter → hasFilter)
 *  - 페이지의 store 콜백을 TreeResourceShell 시그니처로 어댑팅
 *  - 도메인 텍스트 (title/totalLabel) 주입
 *
 * 비책임:
 *  - 트리 렌더링/CRUD/DnD 자체 — 모두 TreeResourceShell이 처리
 */

import { Baby } from "lucide-react";
import type { ChildGroup } from "@/lib/features/children/types";
import { isFilterEmpty } from "@/lib/features/children/utils";
import {
  TreeResourceShell,
  type TreeShellGroup,
} from "@/components/templates/tree-resource-shell/TreeResourceShell";

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
  const treeGroups: TreeShellGroup[] = groups.map((g) => ({
    id: g.id,
    label: g.label,
    parentId: g.parentId,
    order: g.order,
    meta: {
      isSystem: g.id === "all",
      hasFilter: !isFilterEmpty(g.filter),
    },
  }));

  return (
    <TreeResourceShell
      groups={treeGroups}
      selectedId={selectedGroupId}
      counts={counts}
      title="아동 관리"
      headerIcon={<Baby className="w-4 h-4 text-brand-600" />}
      totalLabel="총 아동"
      onSelect={onSelectGroup}
      onAdd={onAddGroup}
      onUpdate={onUpdateGroup}
      onDelete={(id) => {
        onDeleteGroup(id);
        return { ok: true };
      }}
      onMove={onMoveGroup}
      onOpenOptions={onOpenGroupOptions}
    />
  );
}