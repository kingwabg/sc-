"use client";

/**
 * ChildrenClientPage — client shell for app/children/page.tsx
 *
 * Responsibilities:
 *  1. Accept server-fetched children (dbChildren) as prop
 *  2. Seed useChildrenPage with real DB data (hydration-safe)
 *  3. Delegate all UI to the existing ChildrenPageBody
 *
 * Architecture:
 *   page.tsx (Server Component)
 *     → fetches from Prisma
 *     → passes dbChildren to ChildrenClientPage
 *     → ChildrenClientPage calls useChildrenPage({ dbChildren })
 *     → ChildrenPageBody receives all state/handlers from the hook
 */

import { Suspense } from "react";
import type { Child } from "@/lib/features/children/types";
import { useChildrenPage } from "../_hooks/useChildrenPage";
import { ChildrenSidebar } from "./ChildrenSidebar";
import { ChildrenTable } from "./ChildrenTable";
import { AddChildModal } from "./AddChildModal";
import { ChildrenFilterDrawer } from "./ChildrenFilterDrawer";
import { GroupOptionsDrawer } from "./GroupOptionsDrawer";
import { ChildrenPageHeader } from "./ChildrenPageHeader";
import { ChildrenListToolbar } from "./ChildrenListToolbar";
import { TableOptionsDrawer } from "@/components/ui/TableOptionsDrawer";
import { isFilterEmpty, matchesFilter } from "@/lib/features/children/utils";
import { DEFAULT_TABLE_OPTIONS } from "@/components/ui/TableOptionsDrawer";
import type { ChildrenFilter } from "./ChildrenFilterDrawer";

interface ChildrenClientPageProps {
  /** Children fetched from Prisma (server component) */
  dbChildren: Child[];
}

export function ChildrenClientPage({ dbChildren }: ChildrenClientPageProps) {
  const c = useChildrenPage({ dbChildren });
  const selectedGroup = c.groups.find((g) => g.id === c.selectedGroupId);
  const matchedCountForGroup = (() => {
    const g = selectedGroup;
    if (!g || !g.filter || isFilterEmpty(g.filter)) return c.allChildren.length;
    return c.allChildren.filter((child) => matchesFilter(child, g.filter, c.attendanceState)).length;
  })();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <div className="h-[calc(100vh-100px)] sticky top-[80px]">
          <ChildrenSidebar
            selectedGroupId={c.selectedGroupId}
            groups={c.groups}
            counts={c.groupCounts}
            onSelectGroup={c.setSelectedGroupId}
            onAddGroup={c.handleAddGroup}
            onUpdateGroup={c.handleUpdateGroup}
            onDeleteGroup={c.handleDeleteGroup}
            onMoveGroup={c.handleMoveGroup}
            onOpenGroupOptions={c.setGroupOptionsId}
          />
        </div>

        <div className="min-w-0 space-y-3">
          <ChildrenPageHeader
            title={c.title}
            filteredCount={c.filtered.length}
            fillPct={c.fillPct}
            capacityLabel={c.capacityLabel}
            stats={c.stats}
            onAdd={() => c.setShowAddModal(true)}
            onExport={c.handleExport}
          />
          <ChildrenListToolbar
            query={c.query}
            onQueryChange={c.setQuery}
            statusFilter={c.statusFilter}
            onStatusFilterChange={c.setStatusFilter}
            filterActive={c.filterActive}
            onOpenFilter={() => c.setFilterOpen(true)}
            tableOptions={c.tableOptions}
            tableOptionsChanged={c.tableOptionsChanged}
            onOpenTableOptions={() => c.setTableOptionsOpen(true)}
          />
          <ChildrenTable
            children={c.filtered}
            attendanceMap={c.attendanceState}
            options={c.tableOptions}
            onStatusChange={c.handleStatusChange}
          />
        </div>
      </div>

      {c.showAddModal && (
        <AddChildModal
          capacityGroup={50}
          onClose={() => c.setShowAddModal(false)}
          onSubmit={c.handleAddChild}
        />
      )}
      <ChildrenFilterDrawer
        open={c.filterOpen}
        value={c.filter}
        onChange={c.setFilter}
        onClose={() => c.setFilterOpen(false)}
        allergyOptions={c.allergyOptions}
        matched={c.filtered.length}
        total={c.allChildren.length}
      />
      <TableOptionsDrawer
        open={c.tableOptionsOpen}
        value={c.tableOptions}
        onChange={c.setTableOptions}
        onClose={() => c.setTableOptionsOpen(false)}
      />
      <GroupOptionsDrawer
        open={c.groupOptionsId !== null}
        groupLabel={selectedGroup?.label ?? ""}
        initial={selectedGroup?.filter}
        allergyOptions={c.allergyOptions}
        matchedCount={matchedCountForGroup}
        totalCount={c.allChildren.length}
        onClose={() => c.setGroupOptionsId(null)}
        onSave={(f) => {
          if (c.groupOptionsId) c.handleUpdateGroupFilter(c.groupOptionsId, f);
          c.setGroupOptionsId(null);
        }}
      />
    </>
  );
}
