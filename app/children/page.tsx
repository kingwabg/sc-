/**
 * app/children/page.tsx — Server Component
 *
 * Data source migration: mock localStorage → Prisma DB
 *
 * - Server fetches real children from Prisma via db.child.findMany()
 * - Falls back to empty [] (useChildrenPage will use MOCK_CHILDREN) if DB unavailable
 * - Passes dbChildren to ChildrenClientPage (client shell)
 * - ChildrenClientPage seeds useChildrenPage({ dbChildren }) → hydration-safe
 * - Demo mode (?demo=1) still handled in ChildrenClientPage (client-side)
 */

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { mapPrismaChildToDomain, canUseDb } from "@/lib/store/server-children";
import { ChildrenClientPage } from "./_components/ChildrenClientPage";

export default async function ChildrenPage() {
  let dbChildren: import("@/lib/features/children/types").Child[] = [];

  if (canUseDb()) {
    try {
      const rows = await db.child.findMany({
        orderBy: { nameFirst: "asc" },
      });
      dbChildren = rows.map(mapPrismaChildToDomain);
    } catch {
      // DB query failed — ChildrenClientPage will fall back to MOCK_CHILDREN
      dbChildren = [];
    }
  }

  return (
    <AppShell mainClassName="pl-0 sm:pl-0 lg:pl-0">
      <Suspense fallback={null}>
        <ChildrenClientPage dbChildren={dbChildren} />
      </Suspense>
    </AppShell>
  );
}
