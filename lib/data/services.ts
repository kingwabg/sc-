import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Calendar,
  ClipboardList,
  FileText,
  Clock,
  Palmtree,
  BookOpen,
  Bookmark,
  LineChart,
  Archive,
  MessageSquare,
  Library,
  Folder,
  Users,
  Heart,
  CheckSquare,
  Cloud,
  Link2,
  FileSignature,
  GraduationCap,
  Landmark,
  Banknote,
  Receipt,
  Scale,
  FileSpreadsheet,
  Gavel,
  Car,
  BarChart3,
  type LucideIcon as LucideIconType,
} from "lucide-react";

export type ServiceApp = {
  name: string;
  icon: LucideIconType;
  external: boolean;
};

export const SERVICES: ServiceApp[] = [
  // Native
  { name: "Works", icon: LayoutGrid, external: false },
  { name: "캘린더", icon: Calendar, external: false },
  { name: "게시판", icon: ClipboardList, external: false },
  { name: "보고", icon: FileText, external: false },
  { name: "근태", icon: Clock, external: false },
  { name: "휴가", icon: Palmtree, external: false },
  { name: "주소록", icon: BookOpen, external: false },
  { name: "예약", icon: Bookmark, external: false },
  { name: "설문", icon: LineChart, external: false },
  { name: "전사 문서함", icon: Archive, external: false },
  { name: "커뮤니티", icon: MessageSquare, external: false },
  { name: "자료실", icon: Library, external: false },
  { name: "문서관리", icon: Folder, external: false },
  { name: "인사", icon: Users, external: false },
  { name: "복지", icon: Heart, external: false },
  { name: "ToDO+", icon: CheckSquare, external: false },
  { name: "드라이브", icon: Cloud, external: false },
  { name: "링크+", icon: Link2, external: false },
  // External
  { name: "휴가", icon: Palmtree, external: true },
  { name: "고용전자계약", icon: FileSignature, external: true },
  { name: "직원교육", icon: GraduationCap, external: true },
  { name: "금융", icon: Landmark, external: true },
  { name: "급여", icon: Banknote, external: true },
  { name: "경비", icon: Receipt, external: true },
  { name: "매출입", icon: Scale, external: true },
  { name: "세무", icon: FileSpreadsheet, external: true },
  { name: "입찰지", icon: Gavel, external: true },
  { name: "차량운행일지", icon: Car, external: true },
  { name: "리포트", icon: BarChart3, external: true },
];

export type AdminLink = {
  label: string;
  external?: boolean;
};

export const ADMIN_LINKS: AdminLink[] = [
  { label: "통합설정", external: true },
  { label: "고객포털", external: true },
];

export const LINK_PLUS: AdminLink[] = [
  { label: "선물하기", external: true },
];
