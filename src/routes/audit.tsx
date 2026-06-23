import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel } from "@/components/nethra/AppShell";
import { AuditDashboard } from "@/components/nethra/AuditDashboard";

export const Route = createFileRoute("/audit")({
  component: AuditPage,
});

function AuditPage() {
  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <Panel title="Audit Trail" subtitle="Immutable system action logs" className="col-span-12">
          <div className="p-4">
            <AuditDashboard />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
