// NETHRA Live Operations Layer — feed, alerts, traffic pulse, deployments.
// Reads from the shared pulse store; renders the city as a living system.
import { Panel, Badge } from "@/components/nethra/AppShell";
import { usePulse, type Corridor, type FeedItem, type FieldUnit } from "@/lib/pulse";
import { Activity, ArrowDown, ArrowUp, Bot, MapPin, Radio, Siren, TrendingUp, Wifi } from "lucide-react";
import { useEffect, useRef } from "react";

const kindIcon: Record<FeedItem["kind"], typeof Radio> = {
  dispatch: Radio,
  checkin: MapPin,
  alert: Siren,
  sensor: Activity,
  intel: TrendingUp,
  ai: Bot,
};

export function LiveFeed({ className }: { className?: string }) {
  const { feed, citywide } = usePulse();
  const ref = useRef<HTMLDivElement>(null);
  // Highlight the newest item briefly.
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [feed[0]?.id]);

  return (
    <Panel
      title="Live Ops Feed"
      subtitle={`${citywide.advisoriesPerMin}/min advisories · ${citywide.activeUnits} units active`}
      className={className}
      action={
        <Badge tone="success" className="gap-1">
          <span className="size-1.5 rounded-full bg-success pulse-dot" /> LIVE
        </Badge>
      }
    >
      <div ref={ref} className="max-h-[420px] overflow-auto divide-y divide-border">
        {feed.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">Listening to city sensors…</div>
        )}
        {feed.map((f, i) => {
          const Icon = kindIcon[f.kind];
          const color = f.tone === "critical" ? "text-critical"
            : f.tone === "warning" ? "text-warning"
            : f.tone === "success" ? "text-success" : "text-info";
          return (
            <div
              key={f.id}
              className={`flex items-start gap-3 px-3 py-2 text-[13px] ${i === 0 ? "animate-fade-in bg-primary/5" : ""}`}
            >
              <Icon className={`size-3.5 mt-0.5 shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="leading-snug text-foreground/90">{f.text}</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {f.source} · {timeAgo(f.ts)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function TrafficPulse({ className }: { className?: string }) {
  const { corridors, citywide } = usePulse();
  return (
    <Panel
      title="Traffic Pulse"
      subtitle={`Citywide load ${citywide.avgLoad}%`}
      className={className}
      action={<Wifi className="size-3.5 text-success" />}
    >
      <div className="divide-y divide-border">
        {corridors.map((c) => (
          <CorridorRow key={c.id} c={c} />
        ))}
      </div>
    </Panel>
  );
}

function CorridorRow({ c }: { c: Corridor }) {
  const color = c.status === "gridlock" ? "var(--critical)"
    : c.status === "heavy" ? "var(--warning)"
    : c.status === "moderate" ? "var(--info)" : "var(--success)";
  const Trend = c.delta >= 0 ? ArrowUp : ArrowDown;
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between text-[13px]">
        <div className="truncate font-medium">{c.name}</div>
        <span className="font-mono text-xs inline-flex items-center gap-1" style={{ color }}>
          {c.load}%
          <Trend className="size-3" style={{ color: c.delta >= 0 ? "var(--warning)" : "var(--success)" }} />
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${c.load}%`, background: color }} />
      </div>
      <div className="text-[10px] font-mono text-muted-foreground mt-0.5 capitalize">
        {c.status} · {c.flow} veh/min · Δ {c.delta >= 0 ? "+" : ""}{c.delta}%
      </div>
    </div>
  );
}

export function ActiveDeployments({ className }: { className?: string }) {
  const { units } = usePulse();
  return (
    <Panel
      title="Active Deployments"
      subtitle={`${units.length} units in field`}
      className={className}
      action={<Badge tone="info">live GPS</Badge>}
    >
      <div className="max-h-[300px] overflow-auto divide-y divide-border">
        {units.map((u) => <UnitRow key={u.id} u={u} />)}
      </div>
    </Panel>
  );
}

function UnitRow({ u }: { u: FieldUnit }) {
  const tone: "success" | "info" | "warning" | "muted" =
    u.status === "on-scene" ? "success"
    : u.status === "en-route" ? "warning"
    : u.status === "rtb" ? "muted" : "info";
  return (
    <div className="px-3 py-2 flex items-center gap-3 text-[13px]">
      <div className="size-2 rounded-full pulse-dot" style={{
        background: tone === "success" ? "var(--success)"
          : tone === "warning" ? "var(--warning)"
          : tone === "muted" ? "var(--muted-foreground)" : "var(--info)",
      }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium">{u.callsign}</span>
          <Badge tone={tone}>{u.status}</Badge>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
          {u.kind} · {u.speedKph} km/h · {u.lat.toFixed(4)}, {u.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}

export function DynamicAlerts({ className }: { className?: string }) {
  const { alerts } = usePulse();
  return (
    <Panel
      title="Dynamic Alerts"
      subtitle={alerts.length ? `${alerts.length} active` : "All clear"}
      className={className}
      action={<Siren className={`size-3.5 ${alerts.some((a) => a.tone === "critical") ? "text-critical" : "text-muted-foreground"}`} />}
    >
      <div className="divide-y divide-border">
        {!alerts.length && <div className="p-4 text-sm text-muted-foreground">No active alerts.</div>}
        {alerts.map((a, i) => {
          const color = a.tone === "critical" ? "text-critical" : a.tone === "warning" ? "text-warning" : "text-info";
          return (
            <div key={a.id} className={`flex items-center gap-3 px-3 py-2.5 text-[13px] ${i === 0 ? "animate-fade-in" : ""}`}>
              <Siren className={`size-3.5 shrink-0 ${color}`} />
              <div className="flex-1">{a.text}</div>
              <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(a.ts)}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function timeAgo(ts: number) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m}m ago`;
}
