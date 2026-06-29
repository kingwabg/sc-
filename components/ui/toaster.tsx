"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type Toast = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

let push: ((t: Omit<Toast, "id">) => void) | null = null;

export function toast(t: Omit<Toast, "id">) {
  push?.(t);
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    push = (t) => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, 3500);
    };
    return () => {
      push = null;
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-card border min-w-[260px] max-w-md",
            "bg-surface",
            t.type === "success" && "border-success/30",
            t.type === "error" && "border-danger/30",
            t.type === "info" && "border-border"
          )}
          style={{
            animation: "slideInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {t.type === "success" && (
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          )}
          {t.type === "error" && (
            <AlertCircle className="h-4 w-4 text-danger shrink-0" />
          )}
          {t.type === "info" && (
            <Info className="h-4 w-4 text-text-muted shrink-0" />
          )}
          <span className="text-sm">{t.message}</span>
        </div>
      ))}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}