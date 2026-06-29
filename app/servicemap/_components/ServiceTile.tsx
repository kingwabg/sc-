import type { ServiceApp } from "@/lib/data/services";
import { ArrowUpRight } from "lucide-react";

export function ServiceTile({ service }: { service: ServiceApp }) {
  const Icon = service.icon;
  return (
    <a
      href="#"
      className="flex items-center gap-2.5 px-1 py-1.5 rounded-[10px] hover:bg-slate-50 transition group min-w-0"
    >
      <span className="w-10 h-10 rounded-[10px] bg-[#D5F1F3] text-[#0F766E] grid place-items-center shrink-0">
        <Icon className="w-[22px] h-[22px]" strokeWidth={2} />
      </span>
      <span className="text-[13px] font-semibold text-slate-900 truncate inline-flex items-center gap-1 min-w-0">
        <span className="truncate">{service.name}</span>
        {service.external && (
          <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" strokeWidth={2.5} />
        )}
      </span>
    </a>
  );
}
