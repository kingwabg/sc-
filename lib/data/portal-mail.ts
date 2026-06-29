export type Mail = {
  id: string;
  from: string;
  fromInitial: string;
  fromColor: string;
  title: string;
  preview: string;
  time: string;
  unread: boolean;
  tag?: string;
  tagTone?: "blue" | "red" | "default";
};

export const MAIL: Mail[] = [
  {
    id: "m1",
    from: "김민수",
    fromInitial: "김",
    fromColor: "bg-blue-100 text-blue-800",
    title: "주간회의 안건 검토 요청",
    preview: "오늘자 안건 정리해서 검토 부탁드립니다 — 김민수 차장",
    time: "10:23",
    unread: true,
    tag: "업무",
    tagTone: "blue",
  },
  {
    id: "m2",
    from: "박지영",
    fromInitial: "박",
    fromColor: "bg-red-100 text-red-700",
    title: "[긴급] 클라이언트 미팅 일정 변경",
    preview: "오늘 오후 미팅이 오전 10시로 변경되었습니다",
    time: "09:45",
    unread: true,
    tag: "긴급",
    tagTone: "red",
  },
  {
    id: "m3",
    from: "이서준",
    fromInitial: "이",
    fromColor: "bg-emerald-100 text-emerald-700",
    title: "RE: 견적서 송부 건",
    preview: "수정된 견적서 첨부했습니다. 확인 부탁드려요.",
    time: "어제",
    unread: false,
    tag: "회계",
  },
  {
    id: "m4",
    from: "최은우",
    fromInitial: "최",
    fromColor: "bg-amber-100 text-amber-700",
    title: "신규 프로젝트 킥오프 자료 공유",
    preview: "다음 주 월요일 킥오프 자료 검토 부탁드립니다",
    time: "어제",
    unread: false,
    tag: "공유",
  },
  {
    id: "m5",
    from: "정하늘",
    fromInitial: "정",
    fromColor: "bg-violet-100 text-violet-700",
    title: "휴가 신청 승인 요청",
    preview: "7월 1일~3일 연차 사용 신청합니다",
    time: "어제",
    unread: false,
    tag: "결재",
  },
];
