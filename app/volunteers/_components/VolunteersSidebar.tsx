"use client";

/**
 * VolunteersSidebar — 자원봉사자 사이드바 (TreeResourceShell 어댑터)
 *
 * 자원봉사자 구분(공익근무자/자원봉사자/실습생/기타) + 전체 = 1-depth 그룹
 */

import { Heart, Plus } from "lucide-react";
import { VOLUNTEER_TYPE_LABELS, type VolunteerType } from "@/lib/volunteer";
import {
  TreeResourceShell,
  type TreeShellGroup,
} from "@/components/templates/tree-resource-shell/TreeResourceShell";

const ALL_TYPES = Object.keys(VOLUNTEER_TYPE_LABELS) as VolunteerType[];

type Props = {
  selectedType: VolunteerType | "all";
  counts: Record<VolunteerType | "all", number>;
  onSelect: (t: VolunteerType | "all") => void;
  onAdd: () => void;
};

export function VolunteersSidebar({ selectedType, counts, onSelect, onAdd }: Props) {
  const groups: TreeShellGroup[] = [
    { id: "all", label: "전체", parentId: null, order: 0, meta: { isSystem: true } },
    ...ALL_TYPES.map<TreeShellGroup>((t, i) => ({
      id: t,
      label: VOLUNTEER_TYPE_LABELS[t] ?? t,
      parentId: null,
      order: i + 1,
    })),
  ];

  return (
    <TreeResourceShell
      groups={groups}
      selectedId={selectedType}
      counts={counts as Record<string, number>}
      title="자원봉사자 관리"
      headerIcon={<Heart className="w-4 h-4 text-brand-600" />}
      totalLabel="총 자원봉사자"
      showRootAdd={false}
      onSelect={(id) => {
        if (id === "all") {
          onSelect("all");
          return;
        }
        if ((ALL_TYPES as readonly string[]).includes(id)) {
          onSelect(id as VolunteerType);
        }
      }}
      headerAction={
        <button
          onClick={onAdd}
          className="w-7 h-7 rounded-lg bg-brand-600 text-white grid place-items-center hover:bg-brand-700 transition shrink-0"
          title="자원봉사자 등록"
        >
          <Plus className="w-4 h-4" />
        </button>
      }
    />
  );
}