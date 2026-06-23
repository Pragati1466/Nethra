import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel } from "@/components/nethra/AppShell";
import { PatrolRoute } from "@/components/nethra/PatrolRoute";

export const Route = createFileRoute("/patrol")({
  component: PatrolPage,
});

function PatrolPage() {
  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <Panel title="Patrol Route Optimizer" subtitle="TSP-based multi-incident routing" className="col-span-12 lg:col-span-4">
          <div className="p-4">
            <PatrolRoute />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
