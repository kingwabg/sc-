/**
 * lib/db/prisma.ts — Server-only PrismaClient singleton
 *
 * - '@prisma/adapter-pg' 사용 (Supabase Transaction pooler 호환)
 * - Next.js 개발 HMR에서 connection leak 방지 위해 globalThis에 저장
 * - 서버 전용. 클라이언트 코드에서 import ❌
 */
import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. .env.local에 추가하거나 Vercel 환경변수에 등록하세요.",
    );
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const prisma =
  globalThis.__prismaClient ??
  (globalThis.__prismaClient = createClient());
