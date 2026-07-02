import {
  BookOpenCheck,
  GraduationCap,
  HeartHandshake,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { TenantId } from "./types";

export const TENANT_VISUAL: Record<
  TenantId,
  {
    icon: LucideIcon;
    panelIcon: LucideIcon;
    iconClassName: string;
    surfaceClassName: string;
  }
> = {
  "child-center": {
    icon: HeartHandshake,
    panelIcon: Users,
    iconClassName: "bg-amber-50 text-amber-700 ring-amber-200",
    surfaceClassName: "bg-amber-500/16 text-white ring-white/25",
  },
  "nursing-home": {
    icon: Stethoscope,
    panelIcon: Pill,
    iconClassName: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    surfaceClassName: "bg-emerald-500/18 text-white ring-white/25",
  },
  "care-academy": {
    icon: BookOpenCheck,
    panelIcon: GraduationCap,
    iconClassName: "bg-blue-50 text-blue-700 ring-blue-200",
    surfaceClassName: "bg-blue-500/18 text-white ring-white/25",
  },
  "nursing-academy": {
    icon: Stethoscope,
    panelIcon: ShieldCheck,
    iconClassName: "bg-rose-50 text-rose-700 ring-rose-200",
    surfaceClassName: "bg-rose-500/18 text-white ring-white/25",
  },
};
