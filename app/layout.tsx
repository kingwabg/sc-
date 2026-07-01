import type { Metadata } from "next";
import "./globals.css";
import "rsuite/dist/rsuite.min.css";
import { TenantProvider } from "@/lib/tenant-context";
import { Providers } from "./providers";
import { getUser } from "@/lib/supabase/server";
import { SessionProvider } from "@/lib/session";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Office - 돌봄·교육 시설 통합 운영",
  description: "지역아동센터, 요양원, 요양학원, 간호학원 통합 플랫폼",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server Component: Supabase 세션 검증 → SessionProvider에 주입
  const supabaseUser = await getUser();

  const initialUser = supabaseUser
    ? {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name:
          (supabaseUser.user_metadata?.name as string | undefined) ??
          supabaseUser.email?.split("@")[0] ??
          "사용자",
        avatarColor: "#4f46e5",
      }
    : null;

  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans">
        {/* SessionProvider: 서버 사이드에서 Supabase 유저를 검증하여 주입 */}
        <SessionProvider initialUser={initialUser}>
          <TenantProvider>
            <Providers>{children}</Providers>
          </TenantProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
