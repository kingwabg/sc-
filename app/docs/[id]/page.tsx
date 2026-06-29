import { AppShell } from "@/components/layout/AppShell";
import { DocEditor } from "@/components/docs/DocEditor";

export const metadata = {
  title: "문서 편집 - Office",
};

export default function DocEditPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <DocEditor docId={params.id} />
    </AppShell>
  );
}
