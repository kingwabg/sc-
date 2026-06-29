"use client";

/**
 * ToastProvider + useToast
 *
 * rsuite v6의 toaster는 singleton으로 동작 — push된 알림이 자동으로
 * viewport에 그려진다 (별도 React 컴포넌트 마운트 필요 없음).
 * useToaster() hook으로 페이지 어디서든 호출 가능.
 */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { Notification, useToaster } from "rsuite";

type ToastType = "success" | "info" | "warning" | "error";

type ToastCtx = {
  success: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
  error: (msg: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toaster = useToaster();

  const push = useCallback(
    (type: ToastType, msg: string) => {
      toaster.push(
        <Notification
          type={type}
          header={headerFor(type)}
          duration={2800}
          closable
        >
          {msg}
        </Notification>,
        { placement: "topEnd" },
      );
    },
    [toaster],
  );

  const api = useMemo<ToastCtx>(
    () => ({
      success: (m) => push("success", m),
      info: (m) => push("info", m),
      warning: (m) => push("warning", m),
      error: (m) => push("error", m),
    }),
    [push],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function headerFor(type: ToastType): string {
  switch (type) {
    case "success": return "완료";
    case "info":    return "안내";
    case "warning": return "주의";
    case "error":   return "오류";
  }
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      success: (m) => console.log("[toast-success]", m),
      info:    (m) => console.log("[toast-info]", m),
      warning: (m) => console.warn("[toast-warning]", m),
      error:   (m) => console.error("[toast-error]", m),
    };
  }
  return ctx;
}
