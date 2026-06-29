import type { Metadata } from "next";
import "./globals.css";
import { TenantProvider } from "@/lib/tenant-context";

export const metadata: Metadata = {
  title: "Office - 돌봄·교육 시설 통합 운영",
  description: "지역아동센터, 요양원, 요양학원, 간호학원 통합 운영 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans">
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}
