"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Home,
  Mail,
  FileCheck2,
  CalendarDays,
  Baby,
  ClipboardList,
  MessageSquare,
  Users,
  Star,
  X,
  LayoutGrid,
  Folder,
  FileText,
  Clock,
  CalendarCheck,
  PanelLeftClose,
  PanelLeft,
  UserCog,
  ExternalLink,
  BookOpen,
  CalendarRange,
  NotebookPen,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Bug,
  ClipboardCheck,
  MessagesSquare,
  Gift,
  CalendarClock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFavoriteHrefs,
  addFavoriteHref,
  removeFavoriteHref,
  getMailUnreadCount,
  getApprovalPendingCount,
  getTodayScheduleCount,
  getSidebarCollapsed,
  setSidebarCollapsed,
} from "@/lib/store";
import { SidebarUserMenu } from "./SidebarUserMenu";
import { useSession, type UserRole } from "@/lib/session";

// ─── 타입 ───────────────────────────────────────────────────
type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  /** 외부 링크 (새 탭 열기) */
  external?: boolean;
  children?: NavItem[];
  /** 최소 필요 역할 (owner > admin > member) */
  minRole?: UserRole;
};

/** 역할 순위 — 숫자가 클수록 높은 권한 */
const ROLE_RANK: Record<UserRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

// ─── 전체 메뉴 풀 ────────────────────────────────────────────
const ALL_MENU_ITEMS: Record<string, NavItem> = {
  "/portal": { label: "홈", href: "/portal", icon: Home },
  "/mail": { label: "메일", href: "/mail", icon: Mail },
  "/approval": { label: "결재", href: "/approval", icon: FileCheck2 },
  "/calendar": { label: "일정", href: "/calendar", icon: CalendarDays },
  "/documents": { label: "문서관리", href: "/documents", icon: Folder },
  "/docs": { label: "내 문서", href: "/docs", icon: FileText },
  "/servicemap": { label: "서비스 맵", href: "/servicemap", icon: LayoutGrid },
  "/attendance/members": { label: "출석 / 일지", href: "/attendance/members", icon: CalendarCheck },
  "/my-attendance": { label: "내 근태", href: "/my-attendance", icon: Clock },
  "/children": {
    label: "아동관리",
    href: "/children",
    icon: Baby,
    children: [
      { label: "아동 목록", href: "/children", icon: Baby },
      { label: "출결대장", href: "/children/attendance", icon: CalendarCheck },
    ],
  },
  "/daily-log": { label: "운영일지", href: "/daily-log", icon: NotebookPen },
  "/staff": { label: "종사자관리", href: "/staff", icon: UserCog },
  "/board": { label: "게시판", href: "/board", icon: MessageSquare },
  "/org": { label: "조직도", href: "/org", icon: Users },
  "/monthly-plan": { label: "월간계획", href: "/monthly-plan", icon: CalendarRange },
  "/annual-plan": { label: "연간계획", href: "/annual-plan", icon: BookOpen },
  "/programs":   { label: "프로그램 (계획/일지/평가)", href: "/annual-plan", icon: NotebookPen },
  "/audit-prep": { label: "평가 대비 모드", href: "/audit-prep", icon: ShieldCheck },
  "/admin":   { label: "관리자",         href: "/admin",   icon: ShieldAlert, minRole: "admin" },
  "/exec":    { label: "임원 대시보드",  href: "/exec",    icon: Crown,       minRole: "owner" },
  "/role-test": { label: "역할 테스트",  href: "/role-test", icon: Bug },
  "/todo":    { label: "할 일",        href: "/todo",     icon: ClipboardList },
  "/facility/inspection": { label: "시설 안전점검", href: "/facility/inspection", icon: ClipboardCheck },
  "/meetings": { label: "회의록", href: "/meetings", icon: MessagesSquare },
  "/donations": { label: "후원금 대장", href: "/donations", icon: Gift },
  "/documents/expiry": { label: "문서 만료 알림", href: "/documents/expiry", icon: CalendarClock },
  "/preview/care-log": { label: "문서 미리보기 (데모)", href: "/preview/care-log", icon: Eye },
};

// 운영관리 그룹의 하위 메뉴 (연간 → 월간 → 일지 흐름)
const OPERATIONS_CHILDREN = ["/annual-plan", "/monthly-plan", "/daily-log"];

// ─── 고정 그룹 ──────────────────────────────────────────────
const FIXED_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Home",
    items: ["/portal", "/my-attendance", "/calendar", "/mail", "/approval"],
  },
  {
    label: "돌봄운영",
    items: ["/children", "/staff", "/facility/inspection", "/meetings", "/documents"],
  },
  {
    label: "운영관리",
    items: ["/programs", "/attendance/members", ...OPERATIONS_CHILDREN, "/donations"],
  },
  {
    label: "평가",
    items: ["/audit-prep", "/documents/expiry", "/preview/care-log"],
  },
  {
    label: "관리",
    items: ["/admin", "/exec"],
  },
  {
    label: "지원",
    items: ["/board", "/org", "/todo", "/role-test"],
  },
];

const GROUP_LABEL_KR: Record<string, string> = {
  Home: "Home",
  돌봄운영: "돌봄운영",
  운영관리: "운영관리",
  평가: "평가",
  지원: "지원",
  관리: "관리",
};

const BADGE_FN: Record<string, () => number> = {
  "/mail": getMailUnreadCount,
  "/approval": getApprovalPendingCount,
  "/calendar": getTodayScheduleCount,
};

function useBadges() {
  const [badges, setBadges] = useState<Record<string, number>>({});
  useEffect(() => {
    const result: Record<string, number> = {};
    for (const href of Object.keys(BADGE_FN)) {
      result[href] = BADGE_FN[href]();
    }
    setBadges(result);
  }, []);
  return badges;
}

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setFavorites(getFavoriteHrefs());
  }, []);

  const toggle = useCallback((href: string) => {
    if (favorites.includes(href)) {
      const next = favorites.filter((f) => f !== href);
      removeFavoriteHref(href);
      setFavorites(next);
    } else {
      const next = [...favorites, href];
      addFavoriteHref(href);
      setFavorites(next);
    }
  }, [favorites]);

  return { favorites, toggle, editing, setEditing };
}

function useCollapsed() {
  const [collapsed, setCollapsedState] = useState(false);
  useEffect(() => {
    setCollapsedState(getSidebarCollapsed());
  }, []);
  const toggle = useCallback(() => {
    const next = !getSidebarCollapsed();
    setSidebarCollapsed(next);
    setCollapsedState(next);
    window.dispatchEvent(new Event("officex:sidebar-collapsed"));
  }, []);
  return { collapsed, toggle };
}

// ─── Sidebar ─────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const badges = useBadges();
  const { favorites, toggle, editing, setEditing } = useFavorites();
  const { collapsed, toggle: toggleCollapse } = useCollapsed();
  const { user } = useSession();

  const userRole: UserRole = user?.role ?? "member";

  if (collapsed) {
    return <CollapsedSidebar pathname={pathname} badges={badges} onExpand={toggleCollapse} />;
  }

  return (
    <aside className="fixed top-[60px] left-0 bottom-0 w-[220px] bg-white border-r border-slate-200 flex flex-col py-3 transition-[width] duration-200">
      {/* 접기 버튼 */}
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-[11px] font-semibold tracking-wide text-slate-400">메뉴</span>
        <button
          onClick={toggleCollapse}
          title="사이드바 접기"
          className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 즐겨찾기 영역 */}
      {favorites.length > 0 && (
        <div className="mb-3 px-2">
          <div className="flex items-center justify-between mb-1">
            <span className="px-2 text-[11px] font-semibold tracking-wide text-slate-400">
              ★ 즐겨찾기
            </span>
            <button
              onClick={() => setEditing((v) => !v)}
              className={cn(
                "text-[11px] px-1.5 py-0.5 rounded transition",
                editing
                  ? "bg-brand-100 text-brand-700 font-semibold"
                  : "text-slate-400 hover:text-brand-600 hover:bg-brand-50",
              )}
            >
              {editing ? "완료" : "편집"}
            </button>
          </div>
          <nav className="space-y-0.5">
            {favorites.map((href) => {
              const item = ALL_MENU_ITEMS[href];
              if (!item) return null;
              // 역할 필터
              if (item.minRole && ROLE_RANK[userRole] < ROLE_RANK[item.minRole]) return null;
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <div key={href} className="group relative flex items-center">
                  <Link
                    href={href}
                    prefetch={false}
                    className={cn(
                      "flex items-center gap-2.5 h-8 px-3 rounded-lg text-[13px] font-medium flex-1 transition",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <item.icon
                      className={cn("w-[16px] h-[16px]", isActive ? "text-brand-600" : "text-slate-500")}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                  {editing && (
                    <button
                      onClick={() => toggle(href)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-red-400 hover:bg-red-50"
                      title="즐겨찾기에서 제거"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* 고정 그룹 */}
      <div className="flex-1 overflow-y-auto px-2">
        {FIXED_GROUPS.map((group) => {
          const items = group.items
            .filter((href) => !favorites.includes(href))
            .map((href) => ALL_MENU_ITEMS[href])
            .filter(Boolean)
            .filter((item) => {
              // minRole이 설정된 항목은 권한 등급으로 필터링
              if (!item.minRole) return true;
              return ROLE_RANK[userRole] >= ROLE_RANK[item.minRole];
            }) as NavItem[];

          if (items.length === 0) return null;

          return (
            <NavGroup
              key={group.label}
              label={GROUP_LABEL_KR[group.label] ?? group.label}
              items={items}
              pathname={pathname}
              badges={badges}
              editingFavorites={editing}
              onToggleFavorite={toggle}
              favorites={favorites}
            />
          );
        })}

      </div>

      {/* 사용자 메뉴 (로그아웃) — 스크롤 영역 밖, 항상 보임 */}
      <div className="mt-2 pt-2 border-t border-slate-100 px-2">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}

// ─── 접힌 사이드바 (64px 아이콘 바) ─────────────────────────
function CollapsedSidebar({
  pathname,
  badges,
  onExpand,
}: {
  pathname: string;
  badges: Record<string, number>;
  onExpand: () => void;
}) {
  const { favorites } = useFavorites();
  const { user } = useSession();
  const userRole: UserRole = user?.role ?? "member";

  // 펼쳤을 때와 같은 순서로 보여줄 메뉴 (역할 필터 적용)
  const orderedHrefs = [
    ...favorites,
    ...FIXED_GROUPS.flatMap((g) =>
      g.items
        .filter((h) => !favorites.includes(h))
        .filter((h) => {
          const item = ALL_MENU_ITEMS[h];
          if (!item?.minRole) return true;
          return ROLE_RANK[userRole] >= ROLE_RANK[item.minRole];
        }),
    ),
  ];

  return (
    <aside className="fixed top-[60px] left-0 bottom-0 w-[64px] bg-white border-r border-slate-200 flex flex-col py-3 transition-[width] duration-200">
      <div className="flex justify-center mb-2 px-2">
        <button
          onClick={onExpand}
          title="사이드바 펼치기"
          className="w-10 h-10 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <PanelLeft className="w-[18px] h-[18px] -translate-x-px" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {orderedHrefs.map((href) => {
          const item = ALL_MENU_ITEMS[href];
          if (!item) return null;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const badge = badges[href];
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              title={item.label}
              className={cn(
                "relative w-10 h-10 grid place-items-center rounded-lg transition mx-auto",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-brand-600" : "")} />
              {badge ? (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold grid place-items-center">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* 하위 메뉴 라벨 (접힘 상태에서 children이 active면 라벨로 표시) */}
      {(() => {
        const activeChild = orderedHrefs
          .map((h) => ALL_MENU_ITEMS[h])
          .find(
            (i) =>
              i?.children?.some(
                (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
              ),
          );
        if (!activeChild?.children) return null;
        const child = activeChild.children.find(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
        );
        if (!child) return null;
        return (
          <div className="px-2 py-1 text-center text-[10px] text-slate-400 truncate">
            {activeChild.label} · {child.label}
          </div>
        );
      })()}

      {/* 사용자 메뉴 (로그아웃) — 스크롤 영역 밖, 항상 보임 */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <SidebarUserMenu collapsed />
      </div>
    </aside>
  );
}

// ─── NavGroup ────────────────────────────────────────────────
function NavGroup({
  label,
  items,
  pathname,
  badges,
  editingFavorites,
  onToggleFavorite,
  favorites,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  badges: Record<string, number>;
  editingFavorites: boolean;
  onToggleFavorite: (href: string) => void;
  favorites: string[];
}) {
  const isGroupActive = items.some((item) => {
    const isActive =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(item.href + "/");
    const childActive = item.children?.some(
      (child) => pathname === child.href || pathname.startsWith(child.href + "/"),
    );
    return isActive || childActive;
  });

  return (
    <div className="mb-3">
      <h3
        className={`px-3 mb-1 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 ${
          isGroupActive ? "text-brand-600" : "text-slate-400"
        }`}
      >
        {label}
        {isGroupActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
        )}
      </h3>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          // children이 있으면: 해당 그룹에 속한 페이지면 펼침, 아니면 닫힘
          const hasChildren = !!item.children?.length;
          const childActive = hasChildren
            ? item.children!.some(
                (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
              )
            : false;
          const expanded = hasChildren && childActive;

          return (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                prefetch={false}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13.5px] font-medium transition",
                  isActive || childActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px]",
                    isActive || childActive ? "text-brand-600" : "text-slate-500",
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.external && (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                {badges[item.href] ? (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold grid place-items-center">
                    {badges[item.href]}
                  </span>
                ) : null}
              </Link>

              {/* 하위 메뉴 — children이 있고, 그 중 하나가 active면 펼침 */}
              {hasChildren && expanded && (
                <div className="mt-0.5 ml-4 pl-2 border-l border-slate-200 space-y-0.5">
                  {item.children!.map((child) => {
                    const isChildActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        prefetch={false}
                        className={cn(
                          "flex items-center gap-2 h-7 px-2.5 rounded-md text-[12.5px] transition",
                          isChildActive
                            ? "bg-brand-50 text-brand-700 font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        )}
                      >
                        <child.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {!editingFavorites && (
                <button
                  onClick={() => onToggleFavorite(item.href)}
                  className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition"
                  title="즐겨찾기에 추가"
                >
                  <Star className={cn("w-3.5 h-3.5", favorites.includes(item.href) ? "fill-amber-400 text-amber-400" : "")} />
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
