/**
 * Prisma Client singleton (lib/db.ts)
 *
 * 특징:
 *  - dev/prod hot-reload 안전 (globalThis 캐싱)
 *  - DATABASE_URL 없으면 throw (호출부에서 try/catch 로 mock fallback)
 *  - SSR safe — server side only, browser 에서는 부르지 말 것
 *
 * 사용:
 *  import { db } from "@/lib/db";
 *  const children = await db.child.findMany();
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient(): PrismaClient {
  const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL / DIRECT_DATABASE_URL not set");
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db: PrismaClient = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * isDatabaseReady() — DATABASE_URL 환경변수가 있고 prisma generate 가 끝났는지
 * 페이지 레벨에서 fallback 결정할 때 사용.
 */
export function isDatabaseReady(): boolean {
  return !!process.env.DATABASE_URL;
}
