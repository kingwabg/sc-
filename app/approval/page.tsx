import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "./_components/ApprovalSidebar";
import { StatsCards } from "./_components/StatsCards";
import { RecentApprovalList } from "./_components/RecentApprovalList";
import { Clock } from "lucide-react";

// /approval → /approval/default 리다이렉트
export default function ApprovalHomePage() {
  redirect("/approval/default");
}
