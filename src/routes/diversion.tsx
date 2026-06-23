import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { CityMap } from "@/components/nethra/CityMap";
import { MetricStat } from "@/components/nethra/RiskGauge";
import { ExplainabilityPanel } from "@/components/nethra/Explainability";
import {
  diversionRoutesFor,
  explainEvent,
  getEvents,
  predictImpact,
  riskBand,
  subscribe,
  updateEvent,
} from "@/lib/intel";
import { getDiversionRoutes, type OsrmRoute } from "@/lib/osrm.functions";
import { createBengaluruRoadGraph, findNearestNode, severEdgesAtLocation, getPathCoordinates } from "@/lib/graph";
import { dijkstra } from "@/lib/dijkstra";
import { logAudit } from "@/lib/audit";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2,
  Navigation,
  Route as RouteIcon,
  Send,
  ShieldCheck,
  Signal,
} from "lucide-react";

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
  const [roadGraph] = useState(() => createBengaluruRoadGraph());

  const fetchRoutes = useServerFn(getDiversionRoutes);
  const routing = useQuery({
    queryKey: ["osrm", selected?.e.id, selected?.p.impactRadiusKm],
    enabled: !!selected,
    staleTime: 5 * 60_000,
    queryFn: () =>
      fetchRoutes({
        data: {
          lat: selected!.e.lat,
          lng: selected!.e.lng,
          impactRadiusKm: selected!.p.impactRadiusKm,
        },
      }),
  });

  const routes: OsrmRoute[] = routing.data?.routes ?? [];
  // Auto-select the engine's recommendation once routes load.
  useEffect(() => {
    if (chosenRoute) return;
    const rec = routes.find((r) => r.recommended);
    if (rec) setChosenRoute(rec.id);
  }, [routes, chosenRoute]);

  const palette = ["#22d3ee", "#f59e0b", "#22c55e", "#a78bfa"];
  const mapRoutes = routes.map((r, i) => ({
    points: r.geometry,
    color: palette[i % palette.length],
    dashed: chosenRoute !== null && chosenRoute !== r.id,
  }));

  const picked = routes.find((r) => r.id === chosenRoute) ?? routes.find((r) => r.recommended) ?? routes[0];

  // Graph-based diversion routing (fallback/enhancement)
  const graphRoutes = useMemo(() => {
    if (!selected) return [];
    
    const startTime = performance.now();
    const nearestNode = findNearestNode(roadGraph, selected.e.lat, selected.e.lng);
    if (!nearestNode) return [];

    // Sever edges at incident location
    const severedEdges = severEdgesAtLocation(roadGraph, selected.e.lat, selected.e.lng);
    
    // Try to find alternative routes from nearby nodes
    const alternativeRoutes: any[] = [];
    roadGraph.nodes.forEach((node) => {
      if (node.id === nearestNode.id) return;
      const result = dijkstra(roadGraph, node.id, nearestNode.id);
      if (result && result.path.length > 1) {
        alternativeRoutes.push({
          id: `graph-${node.id}`,
          name: `Via ${node.id}`,
          geometry: getPathCoordinates(roadGraph, result.path),
          distanceKm: result.distance,
          extraMinutes: (result.distance / 40) * 60,
          capacityPct: 75,
          congestionReductionPct: 60,
          recommended: false,
        });
      }
    });

    // Restore edges
    severedEdges.forEach((edgeId) => {
      const [from, to] = edgeId.split('-');
      roadGraph.graph.addLink(from, to, 1);
    });

    const responseTime = performance.now() - startTime;
    logAudit('diversion', { 
      eventId: selected.e.id, 
      method: 'graph-based',
      routesFound: alternativeRoutes.length 
    }, responseTime);

    return alternativeRoutes.slice(0, 3);
  }, [selected, roadGraph]);

  // Explainability — synthesize the legacy DiversionRoute shape from the
  // OSRM bundle so the existing Explainability panel keeps working.
  const explanation = useMemo(() => {
    if (!selected || !routes.length) return null;
    const legacyRoutes = routes.map((r) => ({
      id: r.id,
      name: r.name,
      points: r.geometry,
      extraMinutes: r.extraMinutes,
      capacityPct: r.capacityPct,
      coverage: [`${r.distanceKm.toFixed(1)} km`, `${r.congestionReductionPct}% relief`],
      recommended: r.recommended,
    }));
    const legacyPicked = legacyRoutes.find((r) => r.id === (picked?.id)) ?? legacyRoutes[0];
    // Fall back to seed diversions if routing failed entirely.
    const finalRoutes = legacyRoutes.length ? legacyRoutes : diversionRoutesFor(selected.e, selected.p);
    return explainEvent(selected.e, selected.p, legacyPicked, finalRoutes);
  }, [selected, routes, picked]);

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Smart Diversion Planner · OSRM</div>
          <h1 className="text-2xl font-semibold mt-1">Real road-network alternates with live ETA impact</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Routes are computed on OpenStreetMap via OSRM. Pick an event, compare alternates by relief and detour cost,
            lock the route and push turn-by-turn directions to field units.
          </p>
        </div>

        <Panel title="Events" subtitle="Risk-ranked" className="col-span-12 lg:col-span-3 max-h-[640px] overflow-auto">
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

        <Panel
          title="Tactical Map"
          subtitle={selected?.e.name ?? "—"}
          className="col-span-12 lg:col-span-6 h-[640px] flex flex-col"
          action={
            <Badge tone={routing.data?.source === "osrm" ? "success" : routing.isFetching ? "info" : "warning"}>
              {routing.isFetching ? "routing…" : routing.data?.source === "osrm" ? "OSRM · live" : "fallback"}
            </Badge>
          }
        >
          <div className="flex-1 p-2 relative">
            {selected && (
              <CityMap
                events={[selected.e]}
                focus={{ lat: selected.e.lat, lng: selected.e.lng, impactRadiusKm: selected.p.impactRadiusKm, riskScore: selected.p.riskScore }}
                routes={mapRoutes}
                showHeat={false}
              />
            )}
            {routing.isLoading && (
              <div className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Querying OSRM road network…
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Alternate Routes" className="col-span-12 lg:col-span-3 max-h-[640px] overflow-auto">
          <div className="divide-y divide-border">
            {routing.isLoading && (
              <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Computing road-network options…
              </div>
            )}
            {!routing.isLoading && !routes.length && (
              <div className="p-4 text-sm text-muted-foreground">No alternates produced. Try a different event.</div>
            )}
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
                    <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {r.durationMin.toFixed(1)} min</span>
                    <span className="inline-flex items-center gap-1"><RouteIcon className="size-3" /> {r.distanceKm.toFixed(1)} km</span>
                    <span className="inline-flex items-center gap-1 text-warning">+{r.extraMinutes} min</span>
                    <span className="inline-flex items-center gap-1 text-success">-{r.congestionReductionPct}% load</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1.5">
                    Clears incident by {r.minDistanceFromIncidentKm.toFixed(1)} km · capacity {r.capacityPct}%
                  </div>
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

        {selected && picked && (
          <Panel title="Operational Impact" className="col-span-12 lg:col-span-8">
            <div className="p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
              <MetricStat label="Selected route" value={picked.name} sub={`${picked.distanceKm.toFixed(1)} km · ${picked.durationMin.toFixed(1)} min`} tone="info" />
              <MetricStat label="ETA impact" value={`+${picked.extraMinutes} min`} sub={`vs ${routing.data?.baseline?.durationMin?.toFixed(1) ?? "—"} min through-incident`} tone="warning" />
              <MetricStat label="Congestion relief" value={`${picked.congestionReductionPct}%`} sub="estimated demand absorbed" tone="success" />
              <MetricStat label="Avoidance" value={`${picked.minDistanceFromIncidentKm.toFixed(1)} km`} sub="closest approach to incident" tone="info" />
              <MetricStat label="Corridor capacity" value={`${picked.capacityPct}%`} sub="road-class proxy" />
            </div>
            <div className="border-t border-border p-3 flex flex-wrap gap-2 justify-end">
              <Link to="/events/$eventId" params={{ eventId: selected.e.id }} className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border hover:bg-accent/40">
                <RouteIcon className="size-3.5" /> Open event
              </Link>
              <button
                disabled={!picked}
                onClick={() => { updateEvent(selected.e.id, { status: "deployed" }); }}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
              >
                <Send className="size-3.5" /> Push to field units
              </button>
              <button
                disabled={!picked}
                onClick={() => { updateEvent(selected.e.id, { status: "live" }); }}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-critical text-destructive-foreground disabled:opacity-40 hover:opacity-90"
              >
                <ShieldCheck className="size-3.5" /> Activate diversion
              </button>
            </div>
          </Panel>
        )}

        {picked && (
          <Panel
            title="Turn-by-turn"
            subtitle={picked.name}
            className="col-span-12 lg:col-span-4 max-h-[520px] overflow-auto"
            action={<Navigation className="size-4 text-primary" />}
          >
            <ol className="divide-y divide-border">
              {picked.steps.map((s, i) => (
                <li key={i} className="flex gap-3 px-3 py-2.5 text-[13px]">
                  <span className="size-6 shrink-0 rounded-full bg-primary/15 text-primary grid place-items-center font-mono text-[11px]">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="leading-snug">{s.instruction}</div>
                    {s.distanceM > 0 && (
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5 inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1"><Gauge className="size-3" /> {formatDistance(s.distanceM)}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {formatDuration(s.durationS)}</span>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground mt-1.5" />
                </li>
              ))}
            </ol>
          </Panel>
        )}

        {explanation && (
          <ExplainabilityPanel className="col-span-12" explanation={explanation} />
        )}

        {routing.data && !routing.data.ok && (
          <Panel title="Routing notice" className="col-span-12">
            <div className="p-3 text-xs text-warning inline-flex items-center gap-2">
              <Signal className="size-3.5" />
              OSRM unreachable — showing engineered fallback. Reason: {routing.data.error ?? "unknown"}.
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

function formatDistance(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}
function formatDuration(s: number) {
  if (s >= 60) return `${Math.round(s / 60)} min`;
  return `${s}s`;
}
