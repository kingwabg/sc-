import PlaceholderPage from "@/components/layout/PlaceholderPage";

const META: Record<string, { title: string; emoji: string; description: string }> = {
  attendance: { title: "출석 체크", emoji: "✅", description: "오늘의 출근/퇴근, 휴가, 재택근무 신청과 현황을 한 곳에서 관리해요." },
  "daily-log": { title: "운영일지", emoji: "📓", description: "매일의 업무 내용을 기록하고 팀과 공유해요." },
  "monthly-plan": { title: "월간 계획", emoji: "🗓️", description: "월 단위 목표와 일정, 진행률을 한 눈에 확인해요." },
  mail: { title: "메일", emoji: "📧", description: "받은 메일함 · 보낸 메일함 · 중요 메일을 통합 관리해요." },
  calendar: { title: "일정", emoji: "📆", description: "회의, 일정, 마감이 모두 보이는 캘린더." },
  approval: { title: "결재", emoji: "📝", description: "품의서, 지출결의, 휴가신청 — 종이 없는 결재 라인." },
  messenger: { title: "메신저", emoji: "💬", description: "팀원과 실시간으로 대화하고 파일도 함께 공유해요." },
  board: { title: "게시판", emoji: "📋", description: "사내 공지, 자유게시판, 부서별 게시판을 한 곳에서." },
  org: { title: "조직도", emoji: "🏢", description: "임직원, 부서, 팀 구조를 시각적으로 살펴봐요." },
  settings: { title: "설정", emoji: "⚙️", description: "알림, 테마, 보안, 내 정보 — 내 입맛에 맞게 조정해요." },
};

export default function Page() {
  const meta = META["attendance"] ?? META.attendance;
  return <PlaceholderPage {...meta} />;
}
