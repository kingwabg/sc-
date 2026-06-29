"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SERVICES } from "@/lib/data/services";
import { ServiceTile } from "./ServiceTile";

export function ServiceGrid() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERVICES;
    return SERVICES.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-6 mb-7 flex-wrap">
        <div className="flex items-center gap-5 flex-wrap">
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight m-0">
            서비스 맵
          </h1>
          <AvailabilityToggle />
        </div>
        <div className="flex-1 max-w-[480px]">
          <div className="flex items-center h-10 px-3 bg-white border border-slate-200 rounded-[10px] shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="앱 검색"
              className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">
        {filtered.map((service, i) => (
          <ServiceTile key={`${service.name}-${i}`} service={service} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-slate-400 py-12">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}

function AvailabilityToggle() {
  const [on, setOn] = useState(true);
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`block w-9 h-5 rounded-full transition ${
            on ? "bg-brand-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              on ? "translate-x-4" : ""
            }`}
          />
        </span>
      </span>
      <span className="text-[13px] text-slate-500">사용 가능한 앱 보기</span>
    </label>
  );
}
