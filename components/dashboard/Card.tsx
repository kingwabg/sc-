import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type CardProps = {
  title?: string;
  icon?: ReactNode;
  more?: string;
  children?: ReactNode;
  className?: string;
};

export function Card({ title, icon, more, children, className }: CardProps) {
  return (
    <section className={`card-base card-hover p-4 ${className ?? ""}`}>
      {(title || more) && (
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
            {icon && <span className="text-slate-500">{icon}</span>}
            {title}
          </div>
          {more && (
            <button className="inline-flex items-center text-[12px] text-slate-500 hover:text-slate-900">
              {more}
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}
        </header>
      )}
      {children}
    </section>
  );
}