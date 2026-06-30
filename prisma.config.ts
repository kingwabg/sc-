// prisma.config.ts — Prisma 7+ config
// schema.prisma 안의 `datasource.url` 은 deprecated. 이제 config 파일로 이동.
// Supabase Postgres 연결은 `@prisma/adapter-pg` + `pg` 사용.
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  // PostgreSQL 직접 연결: DATABASE_URL 사용 (Prisma migrate + generate 에서 사용)
  // adapter는 PrismaClient 런타임에 별도로 주입 (lib/db/prisma.ts 에서).
});
