import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { CityMap, type MapUnit } from "@/components/nethra/CityMap";
import { MetricStat } from "@/components/nethra/RiskGauge";
import { LiveFeed, TrafficPulse, ActiveDeployments, DynamicAlerts } from "@/components/nethra/LiveOps";
import { ShareButton } from "@/components/ui/share-button";
import { usePulse } from "@/lib/pulse";
import { getEvents, subscribe, predictImpact, riskBand, INCIDENTS, toggleBookmark, isBookmarked } from "@/lib/intel";
import { ArrowRight, Plus, AlertTriangle, Users, Radio, Bot, Star } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NETHRA — Smart City Traffic OS" },
      { name: "description", content: "Predict, simulate, plan, deploy and monitor traffic operations for Bengaluru in one operational system." },
      { property: "og:title", content: "NETHRA — Smart City Traffic Operating System" },
      { property: "og:description", content: "An end-to-end decision-making platform for traffic police, planners and emergency response." },
    ],
  }),
  component: CommandCenter,
});

function useEvents() {
  const [events, setEvents] = useState(getEvents());
  useEffect(() => subscribe(() => setEvents([...getEvents()])), []);
  return events;
}




function unplannedMetricFor(e: any) {
  // For LIVE/unplanned events, replace crowd with operational metrics.
  switch (e.kind) {
    // Karaga Procession (mass gathering) -> crowd count for Operations Queue
    case "festival":
      return e.crowd.toLocaleString();

    // Accident -> vehicles involved
    case "accident":
      return `${Math.max(1, Math.round((e.crowd || 1) / 1000))} vehicles involved`;

    // Construction -> work zone length (proxy from duration)
    case "construction":
      return `${Math.max(0.5, e.durationHours / 12).toFixed(1)} km work zone`;

    // Waterlogging -> lanes submerged (proxy from duration)
    case "waterlogging":
      return `${Math.max(1, Math.round((e.durationHours || 1) / 2))} lanes submerged`;

    // Tree fall -> lanes blocked (proxy from duration)
    case "tree_fall":
      return `${Math.max(1, Math.round((e.durationHours || 1) / 2))} lanes blocked`;

    default:
      return `${e.kind} impact`;
  }
}



function CommandCenter() {
  const events = useEvents();
  const pulse = usePulse();
  const live = events.filter((e) => e.status === "live");
  const planned = events.filter((e) => e.status === "planned" || e.status === "draft");
  const totalCrowd = events.reduce((s, e) => s + e.crowd, 0);
  const mapUnits: MapUnit[] = pulse.units.map((u) => ({
    id: u.id, lat: u.lat, lng: u.lng, callsign: u.callsign, status: u.status,
    tone: u.status === "on-scene" ? "success" : u.status === "en-route" ? "warning" : u.status === "rtb" ? "muted" : "info",
  }));

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4 min-h-[calc(100vh-3rem)]">
        {/* Header strip */}
        <div className="col-span-12 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Command Center</div>
            <h1 className="text-2xl font-semibold mt-1">Bengaluru · Live Operations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All upcoming and live events, ranked by operational risk. Click an event to plan, deploy, or monitor it.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            <Link
              to="/events/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="size-4" /> Create Event
            </Link>
          </div>
        </div>

        {/* KPIs — live */}
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricStat label="Live events" value={live.length} sub="active in field" tone="critical" />
          <MetricStat label="Citywide load" value={`${pulse.citywide.avgLoad}%`} sub={`${pulse.citywide.advisoriesPerMin} advisories/min`} tone={pulse.citywide.avgLoad > 70 ? "critical" : pulse.citywide.avgLoad > 50 ? "warning" : "success"} />
          <MetricStat label="Units in field" value={pulse.citywide.activeUnits} sub={`${planned.length} planned · ${totalCrowd.toLocaleString()} pax`} tone="info" />
          <MetricStat label="Open incidents" value={pulse.citywide.openIncidents} sub={`${INCIDENTS.length.toLocaleString()} historical`} />
        </div>

        {/* Main: map + ops queue */}
        <Panel
          title="Digital Twin"
          subtitle={`Live · tick ${pulse.tick} · ${pulse.units.length} units tracked`}
          className="col-span-12 lg:col-span-8 h-[560px] flex flex-col"
          action={<Badge tone="success" className="gap-1"><span className="size-1.5 rounded-full bg-success pulse-dot" /> LIVE</Badge>}
        >
          <div className="flex-1 p-2">
            <CityMap events={events} units={mapUnits} />
          </div>
        </Panel>

        <Panel
          title="Operations Queue"
          subtitle={`Risk-ranked · ${events.length} events`}
          className="col-span-12 lg:col-span-4 h-[560px] flex flex-col"
        >
          <div className="flex-1 overflow-auto">
            {events.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                All quiet ✨
              </div>
            ) : (
              events
                .map((e) => {
                  const p = predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours });
                  return { e, p };
                })
                .sort((a, b) => b.p.riskScore - a.p.riskScore)
                .map(({ e, p }) => {
                  const band = riskBand(p.riskScore);
                  return (
                    <div key={e.id} className="relative group border-b border-border last:border-0">
                      {/* Star bookmark button */}
                      <button
                        onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); toggleBookmark(e.id); }}
                        className="absolute right-3 top-3 z-10 p-1 rounded hover:bg-accent/60 transition"
                        aria-label={isBookmarked(e.id) ? "Remove bookmark" : "Bookmark event"}
                      >
                        <Star
                          className="size-3.5 transition-colors"
                          fill={isBookmarked(e.id) ? "currentColor" : "none"}
                          style={{ color: isBookmarked(e.id) ? "var(--warning)" : "var(--muted-foreground)" }}
                        />
                      </button>
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: e.id }}
                        className="block px-4 py-3 hover:bg-accent/40 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 size-2.5 rounded-full shrink-0" style={{ background: band.color, boxShadow: `0 0 0 4px ${band.color}22` }} />
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium text-sm truncate">{e.name}</div>
                              <span className="font-mono text-xs" style={{ color: band.color }}>{p.riskScore}</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{e.address}</div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <Badge tone={e.status === "live" ? "critical" : e.status === "planned" ? "warning" : "muted"}>{e.status}</Badge>
                              <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                                {e.status === "planned" ? (
                                  <>
                                    <Users className="inline size-3 mr-0.5" />{e.crowd.toLocaleString()}
                                  </>
                                ) : (
                                  <>{unplannedMetricFor(e)}</>
                                )}
                                <span className="inline">· {p.delayMinutes}min delay</span>
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5" />
                        </div>
                      </Link>
                    </div>
                  );
                })
            )}
          </div>
        </Panel>

        {/* Live Operations Layer */}
        <LiveFeed className="col-span-12 lg:col-span-5" />
        <TrafficPulse className="col-span-12 lg:col-span-4" />
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <DynamicAlerts />
          <ActiveDeployments />
          <Panel title="Quick Actions">
            <div className="grid grid-cols-2 gap-2 p-3">
              <QuickLink to="/events/new" label="New Event" icon={Plus} />
              <QuickLink to="/twin" label="Open Twin" icon={Radio} />
              <QuickLink to="/strategist" label="Ask AI" icon={Bot} />
              <QuickLink to="/demo" label="Demo Mode" icon={AlertTriangle} />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function QuickLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Plus }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-start gap-2 rounded-md border border-border bg-card/40 p-3 hover:border-primary/40 hover:bg-accent/40 transition"
    >
      <Icon className="size-4 text-primary" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
