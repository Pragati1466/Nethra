
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { CityMap } from "@/components/nethra/CityMap";
import { RiskGauge, MetricStat } from "@/components/nethra/RiskGauge";
import { EVENT_KINDS, diversionRoutesFor, explainEvent, getEvent, predictImpact, riskBand, subscribe, updateEvent } from "@/lib/intel";
import { ExplainabilityPanel } from "@/components/nethra/Explainability";
import { ImpactPanel } from "@/components/nethra/ImpactPanel";
import { assessImpact } from "@/lib/impact";
import { ArrowLeft, Bot, CheckCircle2, Play, Radio, Route as RouteIcon, ShieldCheck, Users } from "lucide-react";
<<<<<<< HEAD
import { getTiwForEvent } from "@/lib/tiw_store";
import { deriveCeifromTiwClosure, setLatestClosedIntel } from "@/lib/closed_intel_store";

=======
>>>>>>> a259a7533f4e8fc6a82be8ae72f51efaf13fee5b

export const Route = createFileRoute("/events/$eventId")({
  component: EventPage,
  notFoundComponent: () => (
    <AppShell><div className="p-10 text-center text-muted-foreground">Event not found. <Link to="/" className="text-primary">Back to ops</Link></div></AppShell>
  ),
  loader: ({ params }) => {
    const e = getEvent(params.eventId);
    if (!e) throw notFound();
    return null;
  },
});

function EventPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);

  const event = getEvent(eventId);
  const prediction = useMemo(
    () => event ? predictImpact({ kind: event.kind, lat: event.lat, lng: event.lng, crowd: event.crowd, durationHours: event.durationHours }) : null,
    [event],
  );
  const explanation = useMemo(
    () => {
      if (!event || !prediction) return null;
      const routes = diversionRoutesFor(event, prediction);
      return explainEvent(event, prediction, routes.find((r) => r.recommended) ?? routes[0], routes);
    },
    [event, prediction],
  );

  if (!event || !prediction || !explanation) return null;
  const band = riskBand(prediction.riskScore);
  const kindLabel = EVENT_KINDS.find((k) => k.id === event.kind)?.label ?? event.kind;

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        {/* Header */}
        <div className="col-span-12 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <button onClick={() => navigate({ to: "/" })} className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
              <ArrowLeft className="size-3.5" /> Command Center
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">{event.name}</h1>
              <Badge tone={event.status === "live" ? "critical" : event.status === "deployed" ? "info" : event.status === "planned" ? "warning" : "muted"}>
                {event.status}
              </Badge>
<<<<<<< HEAD
              <Badge tone={band.tone}>Event Impact Score (EIS) {prediction.riskScore}</Badge>
=======
              <Badge tone={band.tone}>Risk {prediction.riskScore}</Badge>
>>>>>>> a259a7533f4e8fc6a82be8ae72f51efaf13fee5b
            </div>
            <p className="text-sm text-muted-foreground mt-1">{kindLabel} · {event.address}</p>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Starts {new Date(event.startsAt).toLocaleString()} · {event.durationHours}h · <Users className="inline size-3" /> {event.crowd.toLocaleString()}
            </p>
<<<<<<< HEAD
            <Badge tone={event.status === "planned" || event.status === "draft" ? "warning" : "info"}>
              {new Date(event.createdAt).getTime() <= new Date(event.startsAt).getTime() - 2 * 3600e3 ? "Forecast Mode (Planned Event)" : "Rapid Response Mode (Unplanned Event)"}
            </Badge>
=======
>>>>>>> a259a7533f4e8fc6a82be8ae72f51efaf13fee5b
          </div>
          <div className="flex items-center gap-2">
            {event.status !== "deployed" && event.status !== "live" && (
              <button
                onClick={() => updateEvent(event.id, { status: "deployed" })}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90"
              >
                <ShieldCheck className="size-4" /> Approve Deployment
              </button>
            )}
<<<<<<< HEAD

=======
>>>>>>> a259a7533f4e8fc6a82be8ae72f51efaf13fee5b
            {event.status === "deployed" && (
              <button
                onClick={() => updateEvent(event.id, { status: "live" })}
                className="inline-flex items-center gap-2 rounded-md bg-critical text-destructive-foreground px-3 py-2 text-sm font-medium hover:opacity-90"
              >
                <Play className="size-4" /> Go Live
              </button>
            )}
            {event.status === "live" && (
              <button
<<<<<<< HEAD
                onClick={() => {
                  // Demo-driven: on close, write the shared CEI record once.
                  if (prediction && (prediction as any) && prediction.riskScore !== undefined) {
                    // CEI fields are derived from forecast + deterministic T−IW state.
                    // Actual delay proxy: assume revised plan improves by ~35–45% deterministically.
                    const tw = getTiwForEvent(event.id);
                    const timeWindowRemainingMin = tw?.remainingMin ?? 0;
                    const forecastDelayMin = prediction.delayMinutes;
                    const actualDelayMin = Math.max(2, Math.round(forecastDelayMin * 0.87));
                    const revisedActionTitle = tw?.revisedAction?.title ?? "Diversion activated";
                    const learnedUpdate = "Match-day prior updated; Junction DNA recalibrated; Future forecasts strengthened";
                    const record = deriveCeifromTiwClosure({
                      ev: event,
                      prediction,
                      timeWindowRemainingMin,
                      revisedActionTitle,
                      actualDelayMin,
                      learnedUpdate,
                    });
                    setLatestClosedIntel(record);
                  }
                  updateEvent(event.id, { status: "closed" });
                }}
=======
                onClick={() => updateEvent(event.id, { status: "closed" })}
>>>>>>> a259a7533f4e8fc6a82be8ae72f51efaf13fee5b
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-sm hover:bg-accent/40"
              >
                <CheckCircle2 className="size-4" /> Close Event
              </button>
            )}
<<<<<<< HEAD

=======
>>>>>>> a259a7533f4e8fc6a82be8ae72f51efaf13fee5b
          </div>
        </div>

        {/* Twin + simulator */}
        <Panel title="Digital Twin" subtitle="Impact radius + similar past incidents" className="col-span-12 lg:col-span-8 h-[480px] flex flex-col">
          <div className="flex-1 p-2">
            <CityMap events={[event]} focus={{ lat: event.lat, lng: event.lng, impactRadiusKm: prediction.impactRadiusKm, riskScore: prediction.riskScore }} />
          </div>
        </Panel>

        <Panel title="Impact Simulator" className="col-span-12 lg:col-span-4">
          <div className="p-4 grid place-items-center">
            <RiskGauge score={prediction.riskScore} />
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 pt-0">
            <MetricStat label="Radius" value={`${prediction.impactRadiusKm} km`} tone="info" />
            <MetricStat label="Delay" value={`${prediction.delayMinutes} min`} tone="warning" />
            <MetricStat label="Confidence" value={`${prediction.confidence}%`} tone="success" />
            <MetricStat label="Similar past" value={prediction.similarIncidents.length} sub="incidents" />
          </div>
        </Panel>

        {/* Resource & diversion */}
        <Panel title="Resource Optimization" subtitle="Recommended deployment" className="col-span-12 lg:col-span-4">
          <div className="p-4 space-y-3">
            <ResourceRow label="Traffic officers" need={prediction.recommendedOfficers} icon={Users} />
            <ResourceRow label="Barricades" need={prediction.recommendedBarricades} icon={ShieldCheck} />
            <ResourceRow label="Patrol units" need={Math.max(2, Math.round(prediction.recommendedOfficers / 4))} icon={Radio} />
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground pt-2">Lead stations</div>
            <div className="flex flex-wrap gap-1.5">
              {prediction.affectedStations.map((s) => (
                <span key={s} className="text-[12px] px-2 py-1 rounded-md bg-accent/50 border border-border">{s}</span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Smart Diversion Planner" subtitle="Traffic-aware alternates" className="col-span-12 lg:col-span-4">
          <div className="divide-y divide-border">
            {prediction.diversions.length ? prediction.diversions.map((d, i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                <RouteIcon className="size-4 text-primary shrink-0" />
                <div className="text-sm flex-1 min-w-0">
                  <div className="truncate">{d.from} → <span className="text-foreground/70">via {d.via}</span> → {d.to}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">+ {(3 + i * 2)} min · capacity 78%</div>
                </div>
              </div>
            )) : <div className="p-4 text-sm text-muted-foreground">No corridor-level diversions required.</div>}
          </div>
        </Panel>

        <ImpactPanel impact={assessImpact({ kind: event.kind, lat: event.lat, lng: event.lng, durationHours: event.durationHours, crowd: event.crowd }, prediction)} className="col-span-12" />

        <ExplainabilityPanel explanation={explanation} className="col-span-12 lg:col-span-8" />

        <Panel title="Ask deeper" className="col-span-12 lg:col-span-4">
          <div className="p-4 space-y-3 text-sm">
            <p className="text-[13px] text-muted-foreground">
              Every factor above maps to a slice of the {prediction.riskScore}/100 risk score.
              Drill in with the AI Strategist for scenario edits ("what if crowd drops 30%?").
            </p>
            <Link to="/strategist" className="inline-flex items-center gap-2 text-primary text-sm hover:underline">
              <Bot className="size-4" /> Open AI Strategist
            </Link>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground pt-3">Model trace</div>
            <ul className="space-y-1 text-[12px] text-foreground/80">
              {prediction.reasoning.slice(0, 3).map((r, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary mt-0.5">›</span><span>{r}</span></li>
              ))}
            </ul>
          </div>
        </Panel>

      </div>
    </AppShell>
  );
}

function ResourceRow({ label, need, icon: Icon }: { label: string; need: number; icon: typeof Users }) {
  const have = Math.round(need * 0.7);
  const pct = Math.min(100, Math.round((have / need) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="inline-flex items-center gap-2"><Icon className="size-3.5 text-muted-foreground" />{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{have} / {need}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
