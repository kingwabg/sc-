"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DailyLogSidebar } from "./_components/DailyLogSidebar";
import { DailyLogViewer } from "./_components/DailyLogViewer";
import { MOCK_DAILY_LOGS } from "@/lib/features/daily-log/data";
import type { DailyLogSummary } from "@/lib/features/daily-log/types";

export default function DailyLogPage() {
  const [selectedId, setSelectedId] = useState<string | null>(
    MOCK_DAILY_LOGS[0]?.id ?? null,
  );

  const summaries: DailyLogSummary[] = MOCK_DAILY_LOGS.map((l) => ({
    id: l.id,
    date: l.date,
    title: l.title,
    authorName: l.authorName,
    authorRole: l.authorRole,
    status: l.status,
    updatedAt: l.updatedAt,
  }));

  const selectedLog = MOCK_DAILY_LOGS.find((l) => l.id === selectedId) ?? null;

  function handleSelect(id: string) {
    setSelectedId(id);
  }

  function handleNew() {
    // TODO: open new log form modal
    console.log("new log");
  }

  function handleNavigate(id: string) {
    setSelectedId(id);
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 items-start">
          {/* Left sidebar */}
          <div className="h-[calc(100vh-100px)] sticky top-[80px]">
            <DailyLogSidebar
              logs={summaries}
              selectedId={selectedId}
              onSelect={handleSelect}
              onNew={handleNew}
            />
          </div>

          {/* Right viewer */}
          <div className="min-w-0">
            <DailyLogViewer
              log={selectedLog}
              logs={summaries}
              onNavigate={handleNavigate}
              onNew={handleNew}
            />
          </div>
        </div>
    </AppShell>
  );
}
