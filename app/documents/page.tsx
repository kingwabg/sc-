"use client";

/**
 * DocumentsPage — 문서 허브 페이지 (단순 카드 그리드)
 *
 * 셸 적용 가치 낮음 — ResourceTable/TreeResourceShell 모두 부적합.
 * 자체 UI + _components/ 추출 정도.
 */

import { AppShell } from "@/components/layout/AppShell";
import { FileText, FileUp, Users } from "lucide-react";
import { DocumentsPageHeader } from "./_components/DocumentsPageHeader";
import { DocumentCard } from "./_components/DocumentCard";

export default function DocumentsPage() {
  return (
    <AppShell>
      <div className="max-w-6xl">
        <DocumentsPageHeader onNew={() => alert("새 문서 기능은 다음 스프린트에서 공개됩니다.")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DocumentCard
            href="/docs"
            icon={<FileText className="w-6 h-6" />}
            iconBg="bg-indigo-100 text-indigo-600"
            title="내 문서함"
            subtitle="Naver SmartEditor 2 (HTML) · 자동저장"
            hint="→ 새 문서 작성 · 목록"
          />
          <DocumentCard
            href="/docs/hwp"
            icon={<FileUp className="w-6 h-6" />}
            iconBg="bg-rose-100 text-rose-600"
            title="HWP 문서함"
            subtitle="rhwp (Rust + WASM) · 한글 호환"
            hint="→ .hwp / .hwpx 파일 열기"
          />
          <DocumentCard
            icon={<Users className="w-6 h-6" />}
            iconBg="bg-slate-100 text-slate-400"
            title="공유 문서함"
            subtitle="팀/시설 단위 공유 폴더 · 결재선 · 권한 관리"
            hint="→ 다음 스프린트에서 공개"
            disabled
            className="md:col-span-2"
          />
        </div>
      </div>
    </AppShell>
  );
}