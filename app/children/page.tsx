"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useChildrenPage } from "./_hooks/useChildrenPage";
import { ChildrenSidebar } from "./_components/ChildrenSidebar";
import { ChildrenTable } from "./_components/ChildrenTable";
import { AddChildModal } from "./_components/AddChildModal";
import { ChildrenFilterDrawer } from "./_components/ChildrenFilterDrawer";
import { GroupOptionsDrawer } from "./_components/GroupOptionsDrawer";
import { ChildrenPageHeader } from "./_components/ChildrenPageHeader";
import { ChildrenListToolbar } from "./_components/ChildrenListToolbar";
import { TableOptionsDrawer } from "@/components/ui/TableOptionsDrawer";
import { isFilterEmpty, matchesFilter } from "@/lib/features/children/utils";

export default function ChildrenPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ChildrenPageBody />
      </Suspense>
    </AppShell>
  );
}

function ChildrenPageBody() {
  const c = useChildrenPage();
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
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            <ChildrenTable
              children={c.filtered}
              attendanceMap={c.attendanceState}
              options={c.tableOptions}
              onStatusChange={c.handleStatusChange}
            />
          </div>
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