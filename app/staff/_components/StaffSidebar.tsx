"use client";

/**
 * StaffSidebar — TreeResourceShell을 사용하는 종사자 도메인 어댑터
 *
 * 책임:
 *  - StaffPosition (flat) → 계층형 그룹 트리로 변환
 *    구조: 전체 → [관리, 교육, 운영, 기타] → 직위
 *  - 그룹 노드 카운트 = 자식 직위 카운트의 합
 *  - TreeResourceShell의 onSelect 시그니처 → StaffPosition | "all"로 어댑팅
 *    (그룹 노드 선택은 페이지 상태에 영향 없음 — 카테고리 표기용)
 *
 * 비책임:
 *  - 트리 렌더링/CRUD/DnD — TreeResourceShell이 처리
 *
 * 추가(등록) 버튼은 페이지 헤더에 있으므로 사이드바에는 노출하지 않음.
 */

import { Briefcase } from "lucide-react";
import type { StaffPosition } from "@/lib/staff";
import { POSITION_LABELS } from "@/lib/staff";
import {
  TreeResourceShell,
  type TreeShellGroup,
} from "@/components/templates/tree-resource-shell/TreeResourceShell";

// ─── 그룹 트리 정의 ─────────────────────────────────────────────
// 부모 그룹 → 직위 매핑. 정적 정의 (추후 동적으로 바뀔 수 있음).
const STAFF_GROUPS: ReadonlyArray<{ id: string; label: string; order: number }> = [
  { id: "g_관리", label: "관리", order: 1 },
  { id: "g_교육", label: "교육", order: 2 },
  { id: "g_운영", label: "운영", order: 3 },
  { id: "g_기타", label: "기타", order: 4 },
];

const POSITION_TO_GROUP: Record<StaffPosition, string> = {
  "所长": "g_관리",
  "支援교사": "g_교육",
  "조리사": "g_운영",
  "행정": "g_운영",
  "기타": "g_기타",
};

const ALL_POSITIONS = Object.keys(POSITION_LABELS) as StaffPosition[];

type Props = {
  selectedPosition: StaffPosition | "all";
  counts: Record<StaffPosition | "all", number>;
  onSelect: (position: StaffPosition | "all") => void;
};

export function StaffSidebar({ selectedPosition, counts, onSelect }: Props) {
  // 그룹 노드 카운트 = 자식 직위 카운트의 합
  const groupCounts: Record<string, number> = {};
  for (const g of STAFF_GROUPS) {
    groupCounts[g.id] = ALL_POSITIONS
      .filter((p) => POSITION_TO_GROUP[p] === g.id)
      .reduce((sum, p) => sum + (counts[p] ?? 0), 0);
  }

  const groups: TreeShellGroup[] = [
    // 최상위 "전체" (system)
    {
      id: "all",
      label: "전체",
      parentId: null,
      order: 0,
      meta: { isSystem: true },
    },
    // 그룹 노드들
    ...STAFF_GROUPS.map<TreeShellGroup>((g) => ({
      id: g.id,
      label: g.label,
      parentId: null,
      order: g.order,
    })),
    // 직위 노드들 (각각 부모 그룹 아래)
    ...ALL_POSITIONS.map<TreeShellGroup>((p, i) => ({
      id: p,
      label: POSITION_LABELS[p] ?? p,
      parentId: POSITION_TO_GROUP[p],
      order: i,
    })),
  ];

  // 카운트 합치기
  const allCounts: Record<string, number> = {
    ...groupCounts,
    ...(counts as Record<string, number>),
  };

  // 그룹 노드 클릭은 페이지 상태에 영향 없음 (카테고리 표기용)
  // → onSelect는 직위/전체만 전달
  const handleSelect = (id: string) => {
    if (id === "all") {
      onSelect("all");
      return;
    }
    if ((ALL_POSITIONS as readonly string[]).includes(id)) {
      onSelect(id as StaffPosition);
      return;
    }
    // 그룹 ID → 무시 (페이지 상태 변경 안 함)
  };

  return (
    <TreeResourceShell
      groups={groups}
      selectedId={selectedPosition}
      counts={allCounts}
      title="종사자 관리"
      headerIcon={<Briefcase className="w-4 h-4 text-brand-600" />}
      totalLabel="총 종사자"
      onSelect={handleSelect}
      showRootAdd={false}
    />
  );
}