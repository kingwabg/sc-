import { AppShell } from "@/components/layout/AppShell";
import { ServiceGrid } from "./_components/ServiceGrid";
import { ServiceAside } from "./_components/ServiceAside";

export const metadata = {
  title: "서비스 맵 - Office",
};

export default function ServiceMapPage() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
        <ServiceGrid />
        <ServiceAside />
      </div>
    </AppShell>
  );
}
