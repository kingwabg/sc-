// prisma.config.ts — Prisma 7+ config
// schema.prisma 안의 `datasource.url` 은 deprecated. 이제 config 파일로 이동.
// Supabase Postgres 연결은 `@prisma/adapter-pg` + `pg` 사용.
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

