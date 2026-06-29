import { AppShell } from "@/components/layout/AppShell";
import { DocList } from "@/components/docs/DocList";

export const metadata = {
  title: "내 문서 - Office",
};

export default function DocsPage() {
  return (
    <AppShell>
      <DocList />
    </AppShell>
  );
}
