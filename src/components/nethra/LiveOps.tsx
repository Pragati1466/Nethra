// NETHRA Live Operations Layer — feed, alerts, traffic pulse, deployments.
// Reads from the shared pulse store; renders the city as a living system.
import { Panel, Badge } from "@/components/nethra/AppShell";
import { usePulse, type Corridor, type FeedItem, type FieldUnit } from "@/lib/pulse";
import { Activity, ArrowDown, ArrowUp, Bot, MapPin, Radio, Siren, TrendingUp, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAllTiw, subscribeTiw, updateTiwFromPulse } from "@/lib/tiw_store";



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
  const { tiwAlerts } = useTiwAlerts();

  return (
    <Panel
      title="Dynamic Alerts"
      subtitle={alerts.length || tiwAlerts.length ? `${alerts.length + tiwAlerts.length} active` : "All clear"}
      className={className}
      action={
        <Siren
          className={`size-3.5 ${
            alerts.some((a: { tone: string }) => a.tone === "critical") ||
            tiwAlerts.some((a: { tone: string }) => a.tone === "critical")
              ? "text-critical"
              : "text-muted-foreground"
          }`}
        />
      }
    >

      <div className="divide-y divide-border">
        {!alerts.length && !tiwAlerts.length && <div className="p-4 text-sm text-muted-foreground">No active alerts.</div>}

        {tiwAlerts.length ? (
          // Show ONLY ONE T−IW alert at a time (highest severity).
          <TiwSingleAlert a={tiwAlerts[0]} />
        ) : (
          // Keep Dynamic Alerts compact and fixed-height friendly.
          <div className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
            <Siren className="size-3.5 shrink-0 text-info" />
            <div className="flex-1">
              <div className="font-medium">🚨 T−IW MONITOR</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Armed · forecast deviation pending</div>
            </div>
          </div>
        )}

        {alerts.map((a, i) => {
          const color = a.tone === "critical" ? "text-critical" : a.tone === "warning" ? "text-warning" : "text-info";
          return (
            <div key={a.id} className={`flex items-center gap-3 px-3 py-2.5 text-[13px] ${i === 0 && !tiwAlerts.length ? "animate-fade-in" : ""}`}>
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

function useTiwAlerts() {
  const pulse = usePulse();


  // Keep the implementation simple and type-safe.
  // We recompute the deterministic T−IW store from the pulse tick, then
  // convert active drift states into UI alert cards.
  

  

  type TiwAlert = { id: string; text: string; sub?: string; tone: "info" | "warning" | "critical"; ts: number };
  const [tiwAlerts, setTiwAlerts] = useState<TiwAlert[]>([]);


  useEffect(() => {
    updateTiwFromPulse(pulse);

    setTiwAlerts(twsToAlerts(getAllTiw()));

    const unsub = subscribeTiw(() => {
      setTiwAlerts(twsToAlerts(getAllTiw()));
    });

    return () => {
      unsub();
    };
  }, [pulse.tick]);

  return { tiwAlerts };
}


function twsToAlerts(tws: ReturnType<typeof import("@/lib/tiw_store")["getAllTiw"]>): {
  id: string;
  text: string;
  sub?: string;
  tone: "info" | "warning" | "critical";
  ts: number;
}[] {
  const now = Date.now();
  return tws
    .filter((t) => t.driftTriggered && t.drift && t.revisedAction)
    .slice(0, 2)
    .map((t) => {
      const tone = t.drift!.severity === "critical" ? "critical" : "warning";
      return {
        id: t.revisedAction!.id,
        text: `🚨 NETHRA T−IW ALERT | FORECAST DEVIATION DETECTED` ,
        sub: `📍 ${t.drift!.corridorName} · T−IW: ${t.remainingMin} min — ${t.revisedAction!.title}`,
        tone,
        ts: now,
      };
    });
}


function TiwSingleAlert({
  a,
}: {
  a: { id: string; text: string; sub?: string; tone: "info" | "warning" | "critical"; ts: number };
}) {
  // Expected `a.sub` format (from twsToAlerts):
  // 📍 {corridorName} · T−IW: {remainingMin} min — {title}
  const sub = a.sub ?? "";
  const corridorLine = sub.split("·")[0]?.replace(/^[^:]*:\s*/g, "") ?? "";
  const remainingMatch = sub.match(/T−IW:\s*(\d+)\s*min/);
  const remainingMin = remainingMatch ? remainingMatch[1] : "—";

  // Compact block to keep Dynamic Alerts height small.
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 text-[13px]">
      <Siren className="size-3.5 shrink-0 text-critical" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium">🚨 T−IW ALERT</div>
          <span
            className="inline-flex items-center justify-center size-4 rounded-full border border-border bg-card/50 text-[10px] text-muted-foreground"
            title="T−IW = minutes remaining before the current intervention plan becomes insufficient due to forecast deviation."
          >i</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{corridorLine.trim() || "Bellary Rd"} · {remainingMin} min remaining</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Forecast deviation detected.</div>
        <div className="text-[11px] text-primary mt-0.5">View revised plan →</div>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(a.ts)}</span>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m}m ago`;
}

