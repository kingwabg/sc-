"use client";

import { AppShell } from "./AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function PlaceholderPage({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로
        </Link>

        <div className="text-center py-16">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">{description}</p>

          <Card className="mt-10 text-left">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Construction className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold">MVP 단계</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                이 메뉴는 다음 스프린트에서 구현 예정이에요.
                우선 대시보드 위젯(메일/일정/결재/할 일/공지/바로가기)에서
                핵심 데이터 흐름을 확인하고 있어요.
              </p>
              <div className="mt-4 flex gap-2">
                <Link href="/">
                  <Button variant="primary" size="sm">대시보드로 가기</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm">다른 계정으로</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}