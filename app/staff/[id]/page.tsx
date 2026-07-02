"use client";

import { useState, Suspense, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  getStaffProfileById,
  MOCK_STAFF_PROFILES,
  POSITION_LABELS,
} from "@/lib/features/staff";
import { Plus, Trash2, Save, ChevronLeft } from "lucide-react";

// Lazy-load the 5 tabs this agent owns; others get a "준비 중" placeholder
const TabComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>> | null> = {
  BasicTab: null,       // loaded directly below
  NewHireTab: null,
  EducationTab: null,
  FamilyTab: null,
  PhotoTab: null,
};

async function loadTab(name: string) {
  try {
    const mod = await import(`./_components/tabs/${name}.tsx`);
    return mod[name] ?? null;
  } catch {
    return null;
  }
}

type TabKey =
  | "기본사항"
  | "신규등록"
  | "학력사항"
  | "가족사항"
  | "사진"
  | "경력사항"
  | "자격면허"
  | "외국어"
  | "상벌"
  | "교육연수"
  | "출장"
  | "휴가"
  | "발령"
  | "근무현황"
  | "메모현황"
  | "변경이력"
  | "보고이력"
  | "경력매트릭스";

const ALL_TABS: TabKey[] = [
  "기본사항", "신규등록", "학력사항", "가족사항", "사진",
  "경력사항", "자격면허", "외국어", "상벌", "교육연수",
  "출장", "휴가", "발령", "근무현황", "메모현황",
  "변경이력", "보고이력", "경력매트릭스",
];

// Tabs this agent owns (synchronously available)
const OWNED_TABS: Record<TabKey, string> = {
  "기본사항": "BasicTab",
  "신규등록": "NewHireTab",
  "학력사항": "EducationTab",
  "가족사항": "FamilyTab",
  "사진": "PhotoTab",
  "경력사항": "CareerTab",
  "자격면허": "CertificationTab",
  "외국어": "ForeignLanguageTab",
  "상벌": "RewardTab",
  "교육연수": "TrainingTab",
  "출장": "BusinessTripTab",
  "휴가": "LeaveTab",
  "발령": "AppointmentTab",
  "근무현황": "WorkStatusTab",
  "메모현황": "MemoTab",
  "변경이력": "ChangeHistoryTab",
  "보고이력": "ReportHistoryTab",
  "경력매트릭스": "CareerMatrixTab",
};

const LOADED: Record<string, React.ComponentType<any> | null> = {};

// ─── stubs for tabs not yet created by other devs ───────────────────────
function StubTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-500">{name}</p>
      <p className="text-xs mt-1">페이지 준비 중입니다</p>
    </div>
  );
}

async function TabContent({ tab, profileId }: { tab: TabKey; profileId: string }) {
  const tabName = OWNED_TABS[tab];

  if (!LOADED[tabName]) {
    const Comp = await loadTab(tabName);
    LOADED[tabName] = Comp;
  }
  const Comp = LOADED[tabName];

  const profile = getStaffProfileById(profileId);
  if (!profile) return <StubTab name={tab} />;

  if (!Comp) return <StubTab name={tab} />;

  // Render with appropriate props
  switch (tabName) {
    case "BasicTab":
      return <Comp profile={profile} />;
    case "NewHireTab":
      return <Comp newHire={profile.newHire} />;
    case "EducationTab":
      return <Comp education={profile.education} />;
    case "FamilyTab":
      return <Comp family={profile.family} />;
    case "PhotoTab":
      return <Comp photoUrl={profile.photo?.url} />;
    default:
      return <StubTab name={tab} />;
  }
}

// ─── main page ─────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StaffDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("기본사항");

  const profile = getStaffProfileById(id);

  if (!profile) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <p className="text-sm">직원을 찾을 수 없습니다.</p>
          <Link href="/staff/list" className="mt-3 text-xs text-indigo-500 hover:underline">
            ← 목록으로
          </Link>
        </div>
      </AppShell>
    );
  }

  const positionLabel = POSITION_LABELS[profile.position] ?? profile.position;

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        {/* ── 상단 액션 바 ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              목록
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-sm font-semibold text-slate-800">
              {profile.basic.nameKr}
              <span className="ml-2 text-slate-400 font-normal text-xs">
                ({positionLabel} / {profile.basic.serialNo})
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              신규
            </button>
            <button className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 border border-red-100 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              삭제
            </button>
            <button className="flex items-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-1.5 transition-colors shadow-sm">
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
          </div>
        </div>

        {/* ── 탭 네비게이션 ── */}
        <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {ALL_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-indigo-600 border-indigo-600"
                    : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── 탭 콘텐츠 ── */}
        <div className="p-6">
          <div key={activeTab} className="animate-in fade-in duration-150">
            <Suspense fallback={
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                로딩 중...
              </div>
            }>
              <TabContent tab={activeTab} profileId={id} />
            </Suspense>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
