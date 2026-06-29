"use client";

import { useState } from "react";
import { Modal, Button } from "rsuite";
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
 * - 클릭 → rsuite Modal 확인 → signOut() + clearTenant() + router.push("/login")
 *   - `window.confirm`을 쓰지 않는 이유: Chrome/특정 환경에서 모달이
 *     `false`를 리턴하면 signOut/clearTenant가 호출되지 않아
 *     `office-portal:tenant` 키가 그대로 남는 버그가 있었음.
 *   - rsuite Modal은 React 상태로 관리되므로 100% 호출이 보장됨.
 *   - signOut()은 localStorage 비우고 officex-session 쿠키도 삭제하므로
 *     미들웨어가 다음 요청을 /login으로 보냄.
 *   - clearTenant()는 별도 키 `office-portal:tenant`도 비움.
 *
 * user 정보가 없으면 렌더하지 않음 (로그인 페이지에서는 사이드바 자체가 없음).
 */
export function SidebarUserMenu({ collapsed = false }: Props) {
  const { user, signOut } = useSession();
  const { clearTenant } = useTenant();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!user) return null;

  const initials = (user.name ?? user.email ?? "?").slice(0, 1).toUpperCase();
  const avatarColor = user.avatarColor ?? "#4f46e5";

  const doLogout = () => {
    setConfirmOpen(false);
    signOut();        // 세션 (user/쿠키) 정리
    clearTenant();    // 사업장 context 정리 — 이게 빠져 있으면 /portal이 tenant 있다고 판단해 `/`로 redirect 안 함.
    router.push("/login");
  };

  const handleLogout = () => setConfirmOpen(true);

  if (collapsed) {
    return (
      <>
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
        <LogoutConfirmModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doLogout}
        />
      </>
    );
  }

  return (
    <>
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
      <LogoutConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doLogout}
      />
    </>
  );
}

function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} size="xs" centered>
      <Modal.Header>
        <Modal.Title>로그아웃 하시겠어요?</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-sm text-slate-600">
        현재 사업장 선택도 함께 초기화됩니다.
        <br />
        다음 로그인 시 사업장 선택 페이지가 먼저 표시됩니다.
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onCancel} appearance="subtle">
          취소
        </Button>
        <Button onClick={onConfirm} appearance="primary" color="red">
          로그아웃
        </Button>
      </Modal.Footer>
    </Modal>
  );
}