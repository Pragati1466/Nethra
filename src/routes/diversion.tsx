import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { CityMap } from "@/components/nethra/CityMap";
import { MetricStat } from "@/components/nethra/RiskGauge";
import {
  diversionRoutesFor,
  getEvents,
  predictImpact,
  riskBand,
  subscribe,
  updateEvent,
} from "@/lib/intel";
import { CheckCircle2, Route as RouteIcon, Send, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/diversion")({
  head: () => ({ meta: [{ title: "Smart Diversion Planner · NETHRA" }] }),
  component: DiversionPage,
});

function DiversionPage() {
  const [events, setEvents] = useState(getEvents());
  useEffect(() => subscribe(() => setEvents([...getEvents()])), []);
  const ranked = useMemo(
    () =>
      events
        .map((e) => ({ e, p: predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours }) }))
        .sort((a, b) => b.p.riskScore - a.p.riskScore),
    [events],
  );
  const [selectedId, setSelectedId] = useState(ranked[0]?.e.id);
  const selected = ranked.find((r) => r.e.id === selectedId) ?? ranked[0];
  const [chosenRoute, setChosenRoute] = useState<string | null>(null);

  const routes = selected ? diversionRoutesFor(selected.e, selected.p) : [];
  const palette = ["#22d3ee", "#f59e0b", "#22c55e"];
  const mapRoutes = routes.map((r, i) => ({
    points: r.points,
    color: palette[i % palette.length],
    dashed: chosenRoute !== null && chosenRoute !== r.id,
  }));

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Smart Diversion Planner</div>
          <h1 className="text-2xl font-semibold mt-1">Generate alternate corridors before congestion forms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick an event, compare traffic-aware alternates, lock the route and push it to field units.
          </p>
        </div>

        <Panel title="Events" subtitle="Risk-ranked" className="col-span-12 lg:col-span-3 max-h-[600px] overflow-auto">
          <div className="divide-y divide-border">
            {ranked.map(({ e, p }) => {
              const band = riskBand(p.riskScore);
              const active = e.id === selected?.e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => { setSelectedId(e.id); setChosenRoute(null); }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-accent/40 transition ${active ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{e.name}</div>
                    <span className="font-mono text-xs" style={{ color: band.color }}>{p.riskScore}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{e.address}</div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Tactical Map" subtitle={selected?.e.name ?? "—"} className="col-span-12 lg:col-span-6 h-[600px] flex flex-col">
          <div className="flex-1 p-2">
            {selected && (
              <CityMap
                events={[selected.e]}
                focus={{ lat: selected.e.lat, lng: selected.e.lng, impactRadiusKm: selected.p.impactRadiusKm, riskScore: selected.p.riskScore }}
                routes={mapRoutes}
                showHeat={false}
              />
            )}
          </div>
        </Panel>

        <Panel title="Alternate Routes" className="col-span-12 lg:col-span-3 max-h-[600px] overflow-auto">
          <div className="divide-y divide-border">
            {routes.map((r, i) => {
              const active = chosenRoute === r.id;
              return (
                <div key={r.id} className={`p-3 ${active ? "bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="size-2.5 rounded-full" style={{ background: palette[i] }} />
                    <div className="text-sm font-medium">{r.name}</div>
                    {r.recommended && <Badge tone="success">recommended</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-muted-foreground mt-1">
                    <span>+{r.extraMinutes} min</span>
                    <span>cap {r.capacityPct}%</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1.5 truncate">via {r.coverage.join(" · ")}</div>
                  <button
                    onClick={() => setChosenRoute(r.id)}
                    className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent/40"}`}
                  >
                    <CheckCircle2 className="size-3.5" /> {active ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>

        {selected && (
          <Panel title="Deployment Summary" className="col-span-12">
            <div className="p-4 grid grid-cols-2 lg:grid-cols-5 gap-3 items-center">
              <MetricStat label="Risk" value={selected.p.riskScore} tone="critical" />
              <MetricStat label="Impact radius" value={`${selected.p.impactRadiusKm} km`} tone="warning" />
              <MetricStat label="Routes generated" value={routes.length} tone="info" sub="alternates" />
              <MetricStat label="Selected" value={chosenRoute ? routes.find((r) => r.id === chosenRoute)!.name : "—"} />
              <div className="flex flex-wrap gap-2 justify-end">
                <Link to="/events/$eventId" params={{ eventId: selected.e.id }} className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border hover:bg-accent/40">
                  <RouteIcon className="size-3.5" /> Open event
                </Link>
                <button
                  disabled={!chosenRoute}
                  onClick={() => { updateEvent(selected.e.id, { status: "deployed" }); }}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
                >
                  <Send className="size-3.5" /> Push to field units
                </button>
                <button
                  disabled={!chosenRoute}
                  onClick={() => { updateEvent(selected.e.id, { status: "live" }); }}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-critical text-destructive-foreground disabled:opacity-40 hover:opacity-90"
                >
                  <ShieldCheck className="size-3.5" /> Activate diversion
                </button>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
