/**
 * app/role-test/_data.ts
 *
 * Role 테스트 페이지 상수 (AGENTS.md §1.1 — page.tsx ≤200줄 룰)
 *
 * - ROLE_INFO: UserRole 별 라벨/아이콘/권한 표시
 * - ROUTE_TEST: 라우트별 접근 가능 Role 목록
 */

import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/session";

export const ROLE_INFO: Record<
  UserRole,
  {
    label: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    description: string;
    canAdmin: boolean;
    canExec: boolean;
  }
> = {
  owner: {
    label: "소유자 (Owner)",
    icon: ShieldCheck,
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    description: "전체 접근 가능 — /admin, /exec 모두 접근 가능",
    canAdmin: true,
    canExec: true,
  },
  admin: {
    label: "관리자 (Admin)",
    icon: ShieldAlert,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    description: "/admin 접근 가능, /exec 접근 불가",
    canAdmin: true,
    canExec: false,
  },
  member: {
    label: "운영자 (Member)",
    icon: Shield,
    color: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
    description: "/admin, /exec 모두 접근 불가",
    canAdmin: false,
    canExec: false,
  },
};

export const ROUTE_TEST: {
  href: string;
  label: string;
  roles: UserRole[];
}[] = [
  { href: "/portal", label: "홈 (/)", roles: ["owner", "admin", "member"] },
  { href: "/admin", label: "관리자 (/admin)", roles: ["owner", "admin"] },
  { href: "/exec", label: "임원 (/exec)", roles: ["owner"] },
  { href: "/children", label: "아동관리", roles: ["owner", "admin", "member"] },
];