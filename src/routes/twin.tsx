import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { TwinMap, type LayerToggles } from "@/components/nethra/TwinMap";
import { TimeScrubber } from "@/components/nethra/TimeScrubber";
import { getEvents, subscribe, INCIDENTS, predictImpact, riskBand } from "@/lib/intel";
import { cellIntensity, formatHourOfWeek } from "@/lib/timefield";
import hexgrid from "@/data/hexgrid.json";
import { Activity, Layers, Map as MapIcon, Flame, Building2, Radio, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin · NETHRA" },
      { name: "description", content: "Bengaluru digital twin: H3 congestion hexes, 168-hour replay scrubber, live event overlay and landmark intelligence." },
      { property: "og:title", content: "NETHRA Digital Twin · Bengaluru" },
      { property: "og:description", content: "Scrub through a week of city traffic. Watch corridors heat up around live events in real time." },
      { property: "og:url", content: "/twin" },
    ],
    links: [{ rel: "canonical", href: "/twin" }],
  }),
  component: TwinPage,
});

const HEX_CELLS = (hexgrid as any).cells as { hourly: number[]; total: number; corridors: string[] }[];
// Normalizer tuned so median-mass hex hits ~35% at peak commute and busiest hex pegs at 1.0.
const MAX_TOTAL = HEX_CELLS.reduce((m, c) => Math.max(m, c.total), 0);
const NORMALIZER = (MAX_TOTAL / 168) * 2.0 * 10 * 0.55;


function TwinPage() {
  const [events, setEvents] = useState(getEvents());
  useEffect(() => subscribe(() => setEvents([...getEvents()])), []);

  // Seed clock: Friday 18:00 UTC ≈ Fri 23:30 IST — peak Bengaluru chaos hour for first impression.
  const [hourOfWeek, setHourOfWeek] = useState(5 * 24 + 13);
  const [layers, setLayers] = useState<LayerToggles>({
    heatmap: true, incidents: false, events: true, landmarks: true, risk: true,
  });
  const [focusId, setFocusId] = useState<string | undefined>(undefined);

  const cityStats = useMemo(() => {
    let activeHexes = 0, totalIntensity = 0, peakIntensity = 0, peakCorridor = "";
    for (const c of HEX_CELLS) {
      const i = cellIntensity(c.hourly, c.total, hourOfWeek, NORMALIZER);
      totalIntensity += i;
      if (i > 0.15) activeHexes++;
      if (i > peakIntensity) {
        peakIntensity = i;
        peakCorridor = c.corridors[0] ?? "—";
      }
    }
    return {
      activeHexes,
      avgIntensity: Math.round((totalIntensity / HEX_CELLS.length) * 100),
      peakPct: Math.round(peakIntensity * 100),
      peakCorridor,
      congestionTier: peakIntensity > 0.7 ? "SEVERE" : peakIntensity > 0.45 ? "HIGH" : peakIntensity > 0.2 ? "MODERATE" : "LIGHT",
    };
  }, [hourOfWeek]);

  const focusEvent = events.find((e) => e.id === focusId);
  const focusPrediction = focusEvent
    ? predictImpact({ kind: focusEvent.kind, lat: focusEvent.lat, lng: focusEvent.lng, crowd: focusEvent.crowd, durationHours: focusEvent.durationHours })
    : null;

  return (
    <AppShell>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Digital Twin</div>
            <h1 className="text-2xl font-semibold mt-1">Bengaluru · Operational Reality Layer</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {INCIDENTS.length.toLocaleString()} historical incidents binned into {HEX_CELLS.length} H3 hex cells across the BBMP area.
              Scrub the week to watch the city breathe; live events overlay on top.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={cityStats.congestionTier === "SEVERE" ? "critical" : cityStats.congestionTier === "HIGH" ? "warning" : cityStats.congestionTier === "MODERATE" ? "info" : "success"}>
              {cityStats.congestionTier}
            </Badge>
            <Badge tone="info">{cityStats.activeHexes} active hexes</Badge>
            <Badge tone="muted">{formatHourOfWeek(hourOfWeek)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Main map (plain div so the absolute children get a proper containing block) */}
          <div className="col-span-12 lg:col-span-9 relative overflow-hidden rounded-lg border border-border bg-panel/70 backdrop-blur h-[calc(100vh-18rem)] min-h-[520px]">
            <div className="absolute inset-0">
              <TwinMap
                events={events}
                hourOfWeek={hourOfWeek}
                layers={layers}
                focusEventId={focusId}
                onSelectEvent={setFocusId}
              />
            </div>


            {/* Top-left overlay: title block */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="rounded-md border border-border bg-panel/85 backdrop-blur px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  NETHRA · TACTICAL VIEW
                </div>
                <div className="text-foreground/80 text-[10px] mt-0.5 normal-case tracking-normal">
                  Peak corridor: <span className="text-warning">{cityStats.peakCorridor}</span> ({cityStats.peakPct}%)
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-10 rounded-md border border-border bg-panel/85 backdrop-blur px-3 py-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Congestion intensity</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-40 rounded-full" style={{ background: "linear-gradient(90deg, rgba(56,189,248,0.4), rgba(250,204,21,0.7), rgba(239,68,68,0.95))" }} />
                <div className="font-mono text-[10px] text-muted-foreground flex justify-between w-20">
                  <span>low</span><span>peak</span>
                </div>
              </div>
            </div>

            {/* Layer toggles */}
            <div className="absolute top-3 right-14 z-10 rounded-md border border-border bg-panel/85 backdrop-blur p-2 space-y-1 w-44">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
                <Layers className="size-3" /> Layers
              </div>
              <LayerToggle label="Heatmap" icon={Flame} checked={layers.heatmap} onChange={(v) => setLayers((l) => ({ ...l, heatmap: v }))} />
              <LayerToggle label="Incident points" icon={AlertTriangle} checked={layers.incidents} onChange={(v) => setLayers((l) => ({ ...l, incidents: v }))} />
              <LayerToggle label="Events" icon={Radio} checked={layers.events} onChange={(v) => setLayers((l) => ({ ...l, events: v }))} />
              <LayerToggle label="Risk halo" icon={Activity} checked={layers.risk} onChange={(v) => setLayers((l) => ({ ...l, risk: v }))} />
              <LayerToggle label="Landmarks" icon={Building2} checked={layers.landmarks} onChange={(v) => setLayers((l) => ({ ...l, landmarks: v }))} />
            </div>
          </div>


          {/* Side rail */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Panel title="City Pulse" subtitle={formatHourOfWeek(hourOfWeek)}>
              <div className="p-3 space-y-3">
                <PulseRow label="Avg intensity" value={`${cityStats.avgIntensity}%`} tone="info" />
                <PulseRow label="Hexes lit" value={`${cityStats.activeHexes} / ${HEX_CELLS.length}`} tone="warning" />
                <PulseRow label="Peak corridor" value={cityStats.peakCorridor} tone="critical" mono={false} />
              </div>
            </Panel>

            <Panel title="Live Events" subtitle="Click on map or list">
              <div className="divide-y divide-border max-h-72 overflow-auto">
                {events.map((e) => {
                  const p = predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours });
                  const band = riskBand(p.riskScore);
                  return (
                    <button
                      key={e.id}
                      onClick={() => setFocusId(e.id)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-accent/40 transition ${focusId === e.id ? "bg-accent/30" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1 size-2 rounded-full" style={{ background: band.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{e.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground truncate">{e.address}</div>
                          <div className="text-[10px] font-mono mt-0.5" style={{ color: band.color }}>
                            risk {p.riskScore} · {p.delayMinutes}min
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            {focusEvent && focusPrediction && (
              <Panel title="Focused Event" action={<Link to="/events/$eventId" params={{ eventId: focusEvent.id }} className="text-[11px] font-mono text-primary hover:underline">Open →</Link>}>
                <div className="p-3 space-y-2">
                  <div className="text-sm font-medium">{focusEvent.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Mini label="Risk" value={focusPrediction.riskScore} />
                    <Mini label="Delay" value={`${focusPrediction.delayMinutes}m`} />
                    <Mini label="Radius" value={`${focusPrediction.impactRadiusKm}km`} />
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    {focusPrediction.reasoning[0]}
                  </div>
                </div>
              </Panel>
            )}
          </div>

          {/* Scrubber spans full width */}
          <div className="col-span-12">
            <TimeScrubber hourOfWeek={hourOfWeek} onChange={setHourOfWeek} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function LayerToggle({ label, icon: Icon, checked, onChange }: { label: string; icon: typeof Flame; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition border ${checked ? "bg-primary/15 border-primary/40 text-foreground" : "bg-transparent border-transparent text-muted-foreground hover:bg-accent/30"}`}
    >
      <Icon className="size-3.5" />
      <span className="flex-1 text-left">{label}</span>
      <span className={`size-2 rounded-full ${checked ? "bg-primary" : "bg-border"}`} />
    </button>
  );
}

function PulseRow({ label, value, tone, mono = true }: { label: string; value: string; tone: "info" | "warning" | "critical"; mono?: boolean }) {
  const colors = { info: "var(--info)", warning: "var(--warning)", critical: "var(--critical)" };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm truncate max-w-[10rem]"} style={{ color: colors[tone] }}>{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-border bg-card/40 py-1.5">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
