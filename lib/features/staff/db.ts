/**
 * lib/features/staff/db.ts — Staff server-side repository
 */
import "server-only";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

export async function listStaff() {
  try {
    return await prisma.staff.findMany({
      where: { tenantId: DEFAULT_TENANT },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("[staff.db] listStaff:", err);
    return [];
  }
}
