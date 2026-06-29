// Settings — 통합설정 좌측 네비게이션 데이터 (다우오피스 스타일)
export type SettingGroup = {
  id: string;
  label: string;
  /** 좌측 최상위 카테고리 (My / Management) */
  scope: "My" | "Management";
  icon?: string;
  /** 중간 사이드바 항목 */
  items: SettingItem[];
};

export type SettingItem = {
  id: string;
  label: string;
  /** 좌측 확장 가능 그룹 */
  expandable?: boolean;
  /** 펼침 시 표시될 서브 항목 */
  children?: SettingSubItem[];
};

export type SettingSubItem = {
  id: string;
  label: string;
  description?: string;
};

export const SETTING_GROUPS: SettingGroup[] = [
  // My 영역
  {
    id: "my-profile",
    label: "내 정보",
    scope: "My",
    items: [
      {
        id: "profile",
        label: "프로필 관리",
        children: [
          { id: "basic", label: "기본 정보", description: "이름, 연락처, 사진 등" },
          { id: "password", label: "비밀번호 변경" },
          { id: "security", label: "보안 설정", description: "2단계 인증, 로그인 알림" },
        ],
      },
      {
        id: "noti",
        label: "알림 설정",
        children: [
          { id: "channels", label: "알림 채널", description: "메일, 메신저, 푸시" },
          { id: "categories", label: "카테고리별 알림" },
        ],
      },
      {
        id: "theme",
        label: "테마",
        children: [
          { id: "appearance", label: "화면 모드", description: "라이트 / 다크" },
          { id: "language", label: "언어", description: "한국어 / English" },
        ],
      },
    ],
  },
  {
    id: "favorites",
    label: "즐겨찾기",
    scope: "My",
    items: [],
  },
  {
    id: "recent",
    label: "최근 사용한 메뉴",
    scope: "My",
    items: [],
  },

  // Management 영역
  {
    id: "general",
    label: "기본 관리",
    scope: "Management",
    items: [
      {
        id: "service",
        label: "서비스 관리",
        expandable: true,
        children: [
          { id: "service-info", label: "서비스 정보" },
          { id: "business", label: "사업자 정보", description: "회사명, 대표자, 사업자등록번호" },
          { id: "branding", label: "브랜드 설정", description: "로고, 컬러, 도메인" },
        ],
      },
      {
        id: "operation",
        label: "운영 관리",
        expandable: true,
        children: [
          { id: "members", label: "구성원 관리" },
          { id: "roles", label: "역할/권한" },
          { id: "groups", label: "부서/그룹" },
        ],
      },
    ],
  },
  {
    id: "data",
    label: "데이터 관리",
    scope: "Management",
    items: [
      {
        id: "storage",
        label: "저장소",
        expandable: true,
        children: [
          { id: "capacity", label: "용량 현황" },
          { id: "retention", label: "보관 기간" },
          { id: "backup", label: "백업/복원" },
        ],
      },
      {
        id: "export",
        label: "내보내기/가져오기",
        children: [
          { id: "csv", label: "CSV/Excel" },
          { id: "bulk", label: "일괄 작업" },
        ],
      },
    ],
  },
  {
    id: "security",
    label: "보안 관리",
    scope: "Management",
    items: [
      {
        id: "access",
        label: "접근 제어",
        expandable: true,
        children: [
          { id: "ip", label: "IP 제한" },
          { id: "device", label: "디바이스 관리" },
          { id: "session", label: "세션 정책" },
        ],
      },
      {
        id: "audit",
        label: "감사 로그",
        children: [
          { id: "logs", label: "활동 로그" },
          { id: "report", label: "보안 리포트" },
        ],
      },
    ],
  },
  {
    id: "apps",
    label: "App 관리",
    scope: "Management",
    items: [
      {
        id: "installed",
        label: "설치된 앱",
        children: [
          { id: "all", label: "전체 앱" },
          { id: "permissions", label: "권한 관리" },
        ],
      },
      {
        id: "integrations",
        label: "외부 연동",
        children: [
          { id: "api", label: "API 키" },
          { id: "webhooks", label: "웹훅" },
        ],
      },
    ],
  },
  {
    id: "integrate",
    label: "시스템 연동",
    scope: "Management",
    items: [
      {
        id: "external",
        label: "외부 시스템",
        children: [
          { id: "sso", label: "SSO" },
          { id: "hr", label: "인사 시스템" },
          { id: "billing", label: "결제 시스템" },
        ],
      },
    ],
  },
];

export function getGroupById(id: string): SettingGroup | undefined {
  return SETTING_GROUPS.find((g) => g.id === id);
}

export function getItemById(groupId: string, itemId: string) {
  const group = getGroupById(groupId);
  const item = group?.items.find((i) => i.id === itemId);
  return { group, item };
}