/**
 * lib/features/volunteer/db.ts — Volunteer server-side repository
 */
import "server-only";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

export async function listVolunteers() {
  try {
    return await prisma.volunteer.findMany({
      where: { tenantId: DEFAULT_TENANT },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("[volunteer.db] listVolunteers:", err);
    return [];
  }
}
