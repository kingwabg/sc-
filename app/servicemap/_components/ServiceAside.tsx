import { ArrowUpRight } from "lucide-react";
import { ADMIN_LINKS, LINK_PLUS } from "@/lib/data/services";

export function ServiceAside() {
  return (
    <aside className="border-l border-slate-200 pl-6 flex flex-col gap-7">
      <Section title="관리자" links={ADMIN_LINKS} />
      <Section title="Link+" links={LINK_PLUS} />
    </aside>
  );
}

function Section({ title, links }: { title: string; links: { label: string; external?: boolean }[] }) {
  return (
    <section>
      <h3 className="text-[14px] font-bold text-slate-900 m-0 mb-2.5 tracking-tight">
        {title}
      </h3>
      <ul className="flex flex-col">
        {links.map((l) => (
          <li key={l.label} className="mt-1.5 first:mt-0">
            <a
              href="#"
              className="flex items-center gap-1.5 py-1.5 text-[13px] font-medium text-slate-700 hover:text-brand-700 transition"
            >
              <span>{l.label}</span>
              {l.external && (
                <ArrowUpRight className="w-3 h-3 text-slate-400" strokeWidth={2.5} />
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
