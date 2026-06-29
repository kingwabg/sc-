"use client";

import { useSession } from "@/lib/session";
import { useTenant } from "@/lib/tenant-context";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type Props = { collapsed?: boolean };

/**
 * Sidebar 하단의 사용자 메뉴 (B-1 컴팩트 row).
 *
 * - 확장 모드: 아바타 + 이름 + 이메일 + 로그아웃 아이콘
 * - 접힘 모드: 아바타만 (클릭 시 동일 동작)
 * - 클릭 → confirm → signOut() + router.push("/login")
 *   signOut()은 localStorage 비우고 officex-session 쿠키도 삭제하므로
 *   미들웨어가 다음 요청을 /login으로 보냄.
 *
 * user 정보가 없으면 렌더하지 않음 (로그인 페이지에서는 사이드바 자체가 없음).
 */
export function SidebarUserMenu({ collapsed = false }: Props) {
  const { user, signOut } = useSession();
  const { clearTenant } = useTenant();
  const router = useRouter();

  if (!user) return null;

  const initials = (user.name ?? user.email ?? "?").slice(0, 1).toUpperCase();
  const avatarColor = user.avatarColor ?? "#4f46e5";

  const handleLogout = () => {
    // 실수 방지를 위해 한 번 확인.
    if (typeof window !== "undefined" && !window.confirm("로그아웃 하시겠어요?")) {
      return;
    }
    signOut();        // 세션 (user/쿠키) 정리
    clearTenant();    // 사업장 context 정리 — 이게 빠져 있어서 /portal이 tenant 있다고 판단해 `/`로 redirect 안 했음.
    router.push("/login");
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        title={`${user.name} — 로그아웃`}
        aria-label="로그아웃"
        className="w-10 h-10 rounded-full grid place-items-center text-white text-[14px] font-bold mx-auto hover:ring-2 hover:ring-red-400/40 hover:brightness-95 transition"
        style={{ background: avatarColor }}
      >
        {initials}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="로그아웃"
      aria-label="로그아웃"
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition text-left group"
    >
      <span
        className="w-8 h-8 rounded-full grid place-items-center text-white text-[13px] font-bold shrink-0"
        style={{ background: avatarColor }}
      >
        {initials}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-slate-900 truncate">
          {user.name}
        </span>
        <span className="block text-[11px] text-slate-500 truncate">{user.email}</span>
      </span>
      <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition shrink-0" />
    </button>
  );
}