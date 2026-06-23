import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { MetricStat } from "@/components/nethra/RiskGauge";
import { rollupResources, subscribe } from "@/lib/intel";
import { Radio, ShieldCheck, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resource Optimization · NETHRA" }] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [pool, setPool] = useState(rollupResources());
  useEffect(() => subscribe(() => setPool(rollupResources())), []);

  const pools = [
    { key: "officers", label: "Officers", icon: Users, data: pool.officers, tone: "info" as const },
    { key: "barricades", label: "Barricades", icon: ShieldCheck, data: pool.barricades, tone: "warning" as const },
    { key: "patrols", label: "Patrol units", icon: Radio, data: pool.patrols, tone: "success" as const },
  ];

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Resource Optimization</div>
          <h1 className="text-2xl font-semibold mt-1">Citywide allocation across active operations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live coverage vs. predicted demand. NETHRA flags shortages and suggests reassignment from low-risk events.
          </p>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          {pools.map(({ key, label, icon: Icon, data, tone }) => {
            const gap = data.required - data.deployed;
            const coverage = Math.min(100, Math.round((data.deployed / Math.max(1, data.required)) * 100));
            return (
              <Panel key={key} title={label}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-primary" />
                    <Badge tone={gap > 0 ? "critical" : "success"}>
                      {gap > 0 ? `short ${gap}` : "covered"}
                    </Badge>
                  </div>
                  <div className="font-mono text-3xl font-semibold">{data.deployed}<span className="text-base text-muted-foreground">/{data.required}</span></div>
                  <div className="text-[11px] text-muted-foreground font-mono">pool {data.total} · required {data.required}</div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${coverage}%`, background: gap > 0 ? "var(--critical)" : "var(--success)" }} />
                  </div>
                  <MetricStat label="Coverage" value={`${coverage}%`} tone={tone} />
                </div>
              </Panel>
            );
          })}
        </div>

        <Panel title="Per-event allocation" subtitle="Click an event to adjust deployment" className="col-span-12">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5">Event</th>
                  <th className="text-left px-3 py-2.5">Status</th>
                  <th className="text-right px-3 py-2.5">Risk</th>
                  <th className="text-right px-3 py-2.5">Officers</th>
                  <th className="text-right px-3 py-2.5">Barricades</th>
                  <th className="text-right px-3 py-2.5">Patrols</th>
                  <th className="text-right px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pool.perEvent.map((e) => (
                  <tr key={e.id} className="hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-medium">{e.name}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={e.status === "live" ? "critical" : e.status === "planned" ? "warning" : e.status === "deployed" ? "info" : "muted"}>{e.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">{e.risk}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{e.officers}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{e.barricades}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{e.patrols}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link to="/events/$eventId" params={{ eventId: e.id }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Zap className="size-3" /> open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
