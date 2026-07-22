import { ToolsArsenal } from '@/components/sections/ToolsArsenal';
import { getAllTools } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function ToolsPage() {
  const tools = await getAllTools();
  return (
    <main className="min-h-screen bg-void pt-32">
      <ToolsArsenal tools={tools} />
    </main>
  );
}
