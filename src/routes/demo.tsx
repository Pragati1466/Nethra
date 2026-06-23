import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CityMap } from "@/components/nethra/CityMap";
import { RiskGauge } from "@/components/nethra/RiskGauge";
import {
  addEvent,
  diversionRoutesFor,
  predictImpact,
  riskBand,
  type PlannedEvent,
} from "@/lib/intel";
import {
  Play, Pause, SkipForward, RotateCcw, X, Radio, Shield, Users,
  Activity, AlertTriangle, Route as RouteIcon, ClipboardCheck, Sparkles,
  Database, Radar,
} from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Demo · NETHRA Auto-Pilot" },
      { name: "description", content: "Watch NETHRA run a full operational lifecycle for a major Bengaluru event in 90 seconds — prediction, planning, deployment, and after-action report." },
    ],
  }),
  component: DemoPage,
});

// ----------------------------------------------------------------------------
// SCENARIO
// ----------------------------------------------------------------------------
const DEMO_EVENT: Omit<PlannedEvent, "id" | "status" | "createdAt"> & { id?: string } = {
  name: "RCB vs CSK · IPL Final",
  kind: "cricket",
  lat: 12.9788, lng: 77.5996,
  address: "M. Chinnaswamy Stadium, Cubbon Road, Bengaluru",
  crowd: 42000,
  durationHours: 6,
  startsAt: new Date(Date.now() + 3 * 3600e3).toISOString(),
};

// ----------------------------------------------------------------------------
// ACT TIMELINE (total ≈ 90s)
// ----------------------------------------------------------------------------
type ActId =
  | "title" | "intel" | "predict" | "simulate" | "impact"
  | "divert" | "deploy" | "command" | "report";

type Act = {
  id: ActId;
  label: string;
  duration: number; // seconds
  caption: string;
  sub: string;
  Icon: typeof Sparkles;
};

const ACTS: Act[] = [
  { id: "title",    label: "Auto-Pilot",       duration: 4,  Icon: Sparkles,
    caption: "NETHRA AUTO-PILOT",
    sub: "Watch a smart city operating system run a 6-hour event in 90 seconds." },
  { id: "intel",    label: "Event Ingested",   duration: 9,  Icon: Database,
    caption: "T-3h · Event detected from BBMP calendar",
    sub: "RCB vs CSK — IPL Final · M. Chinnaswamy Stadium · 42,000 expected." },
  { id: "predict",  label: "Risk Predicted",   duration: 10, Icon: Radar,
    caption: "Risk model running on 8,173 historical incidents",
    sub: "Cross-referencing 14 nearest precedents with day-of-week × weather × crowd priors." },
  { id: "simulate", label: "Congestion Sim",   duration: 9,  Icon: Activity,
    caption: "Propagating congestion across the road graph",
    sub: "Simulating spillback into MG Road, Cubbon Park, and ORR East." },
  { id: "impact",   label: "Impact Zones",     duration: 9,  Icon: AlertTriangle,
    caption: "Impact footprint locked",
    sub: "11 junctions · 4 corridors · 38k people-hours at risk inside the radius." },
  { id: "divert",   label: "Diversions",       duration: 11, Icon: RouteIcon,
    caption: "Generating 3 corridor-level diversions",
    sub: "North bypass · South arterial · East ring loop — ranked by capacity & ETA." },
  { id: "deploy",   label: "Resources",        duration: 11, Icon: Shield,
    caption: "Allocating officers, barricades & patrols",
    sub: "Roll-up dispatched to MG Road, Cubbon Park and Trinity gates." },
  { id: "command",  label: "Command Center",   duration: 11, Icon: Radio,
    caption: "Command Center activated · Live monitoring",
    sub: "All units online. Heartbeat 2s. Strategist on standby." },
  { id: "report",   label: "After-Action",     duration: 16, Icon: ClipboardCheck,
    caption: "Event closed · After-action report compiled",
    sub: "Outcome reconciled against prediction. Model v1.3 → v1.4 queued." },
];

const TOTAL = ACTS.reduce((s, a) => s + a.duration, 0);

// ----------------------------------------------------------------------------
// PAGE
// ----------------------------------------------------------------------------
function DemoPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [t, setT] = useState(0);           // elapsed seconds (float)
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  // Drive the timeline with rAF.
  useEffect(() => {
    if (!playing) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= TOTAL) { setPlaying(false); return TOTAL; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing]);

  // Determine current act + intra-act progress 0..1.
  const { actIdx, actProgress } = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < ACTS.length; i++) {
      const end = acc + ACTS[i].duration;
      if (t < end || i === ACTS.length - 1) {
        return { actIdx: i, actProgress: Math.min(1, (t - acc) / ACTS[i].duration) };
      }
      acc = end;
    }
    return { actIdx: ACTS.length - 1, actProgress: 1 };
  }, [t]);

  const prediction = useMemo(() => predictImpact(DEMO_EVENT), []);
  const diversions = useMemo(
    () => diversionRoutesFor({ ...DEMO_EVENT, id: "DEMO", status: "planned", createdAt: new Date().toISOString() }, prediction),
    [prediction],
  );

  function start() {
    setStarted(true);
    setT(0);
    setPlaying(true);
  }
  function pause() { setPlaying(false); }
  function resume() {
    if (t >= TOTAL) { setT(0); }
    setPlaying(true);
  }
  function skip() {
    let acc = 0;
    for (let i = 0; i <= actIdx; i++) acc += ACTS[i].duration;
    setT(Math.min(TOTAL, acc + 0.01));
  }
  function restart() { setT(0); setPlaying(true); }

  function finalize() {
    const id = "EVT-" + Math.floor(2000 + Math.random() * 8000);
    addEvent({
      id,
      ...DEMO_EVENT,
      status: "live",
      createdAt: new Date().toISOString(),
    });
    navigate({ to: "/events/$eventId", params: { eventId: id } });
  }

  if (!started) return <LaunchScreen onStart={start} onExit={() => navigate({ to: "/" })} />;

  const act = ACTS[actIdx];
  const finished = t >= TOTAL && !playing;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[oklch(0.07_0.02_250)] text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60 bg-[oklch(0.10_0.02_250)]">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-md bg-primary/15 border border-primary/40 grid place-items-center">
            <Radio className="size-3.5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">NETHRA · Auto-Pilot</div>
            <div className="text-sm font-semibold">Cinematic Demo · 90 seconds</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>Act {actIdx + 1} / {ACTS.length}</span>
          <span className="opacity-40">·</span>
          <span>{Math.floor(t).toString().padStart(2, "0")}s / {TOTAL}s</span>
        </div>
        <div className="flex items-center gap-1.5">
          {playing ? (
            <CtrlButton onClick={pause} icon={<Pause className="size-3.5" />} label="Pause" />
          ) : (
            <CtrlButton onClick={resume} icon={<Play className="size-3.5" />} label={finished ? "Replay" : "Resume"} />
          )}
          <CtrlButton onClick={skip} icon={<SkipForward className="size-3.5" />} label="Skip act" />
          <CtrlButton onClick={restart} icon={<RotateCcw className="size-3.5" />} label="Restart" />
          <CtrlButton onClick={() => navigate({ to: "/" })} icon={<X className="size-3.5" />} label="Exit" />
        </div>
      </header>

      {/* Stage */}
      <main className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Map canvas */}
        <section className="col-span-12 lg:col-span-7 relative rounded-lg border border-border/60 overflow-hidden bg-[oklch(0.09_0.02_250)]">
          <CityMap
            height="100%"
            events={actIdx >= 1 ? [stagedEvent(actIdx)] : []}
            focus={actIdx >= 3 ? {
              lat: DEMO_EVENT.lat, lng: DEMO_EVENT.lng,
              impactRadiusKm: prediction.impactRadiusKm * (actIdx >= 4 ? 1 : 0.45 + actProgress * 0.55),
              riskScore: prediction.riskScore,
            } : null}
            routes={actIdx >= 5 ? diversions.slice(0, actIdx >= 6 ? 3 : Math.max(1, Math.ceil(actProgress * 3))).map((d, i) => ({
              points: d.points,
              color: i === 0 ? "oklch(0.78 0.16 200)" : i === 1 ? "oklch(0.80 0.16 60)" : "oklch(0.74 0.18 145)",
              dashed: i > 0,
              label: d.name,
            })) : undefined}
            showHeat={actIdx >= 3}
          />
          {/* Scanline / cinematic veil */}
          <div className="pointer-events-none absolute inset-0" style={{
            background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, oklch(0.10 0.02 250 / 0.10) 4px)",
          }} />
          {/* Top-left act badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[oklch(0.10_0.02_250_/_0.85)] border border-border/60 backdrop-blur">
            <act.Icon className="size-3.5 text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary">{act.label}</span>
          </div>
          {/* Bottom narration */}
          <div className="absolute left-3 right-3 bottom-3">
            <div key={act.id} className="animate-fade-in rounded-lg border border-border/60 bg-[oklch(0.10_0.02_250_/_0.92)] backdrop-blur px-4 py-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary/90">{act.caption}</div>
              <div className="text-sm text-foreground/90 mt-1">{act.sub}</div>
            </div>
          </div>
        </section>

        {/* Scene card */}
        <aside className="col-span-12 lg:col-span-5 rounded-lg border border-border/60 bg-[oklch(0.10_0.02_250)] overflow-hidden flex flex-col">
          <SceneCard act={act} progress={actProgress} prediction={prediction} diversions={diversions} />
        </aside>
      </main>

      {/* Timeline */}
      <footer className="px-4 pb-3 pt-1 bg-[oklch(0.10_0.02_250)] border-t border-border/60">
        <div className="flex items-stretch gap-1 h-2 rounded-full overflow-hidden bg-border/40">
          {ACTS.map((a, i) => {
            const fill = i < actIdx ? 1 : i === actIdx ? actProgress : 0;
            return (
              <div key={a.id} className="relative" style={{ flex: a.duration }}>
                <div className="absolute inset-0" style={{
                  background: i === actIdx ? "linear-gradient(90deg, var(--primary), oklch(0.85 0.18 200))" : "var(--primary)",
                  opacity: i < actIdx ? 0.5 : 1,
                  transform: `scaleX(${fill})`,
                  transformOrigin: "left",
                  transition: i === actIdx ? "none" : "transform 0.3s",
                }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          {ACTS.map((a, i) => (
            <button
              key={a.id}
              onClick={() => {
                let acc = 0;
                for (let k = 0; k < i; k++) acc += ACTS[k].duration;
                setT(acc + 0.01);
              }}
              className={`text-[9px] font-mono uppercase tracking-wider px-1 transition ${
                i === actIdx ? "text-primary" : i < actIdx ? "text-muted-foreground" : "text-muted-foreground/50"
              } hover:text-primary`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {finished && (
          <div className="mt-3 flex items-center justify-between rounded-md border border-success/40 bg-success/10 px-4 py-2.5">
            <div className="text-sm">
              <span className="font-medium text-foreground">Demo complete.</span>{" "}
              <span className="text-muted-foreground">Open this scenario as a live event in the Command Center?</span>
            </div>
            <div className="flex gap-2">
              <button onClick={restart} className="text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-card/80">Replay</button>
              <button onClick={finalize} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5">
                <ClipboardCheck className="size-3.5" /> Open in Command Center
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

// Stage the event status by act, so the pin color shifts as the story progresses.
function stagedEvent(actIdx: number): PlannedEvent {
  return {
    ...DEMO_EVENT,
    id: "DEMO",
    status: actIdx >= 7 ? "live" : actIdx >= 6 ? "deployed" : "planned",
    createdAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------------
// LAUNCH
// ----------------------------------------------------------------------------
function LaunchScreen({ onStart, onExit }: { onStart: () => void; onExit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 30% 20%, oklch(0.22 0.05 220), oklch(0.07 0.02 250) 60%)",
      }}
    >
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "linear-gradient(oklch(0.78 0.16 200 / 0.18) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.16 200 / 0.18) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <button onClick={onExit} className="absolute top-5 right-5 size-9 grid place-items-center rounded-md border border-border bg-card/60 hover:bg-card text-muted-foreground"><X className="size-4" /></button>
      <div className="relative text-center px-6 max-w-2xl animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-[10px] font-mono uppercase tracking-[0.22em] text-primary">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Auto-Pilot Demo
        </div>
        <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight">
          See Bengaluru <span className="text-primary">re-plan itself</span><br />in 90 seconds.
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground">
          NETHRA stages a major cricket final at Chinnaswamy, predicts risk from 8,173 historical incidents,
          simulates congestion, plans diversions, deploys officers, and reports the outcome — autonomously.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={onStart}
            className="group inline-flex items-center gap-2.5 rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 shadow-[0_0_40px_-10px_var(--primary)]">
            <Play className="size-4" /> Run Auto-Pilot
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-70 group-hover:opacity-100">90s</span>
          </button>
          <button onClick={onExit} className="text-sm text-muted-foreground hover:text-foreground px-3 py-3">Skip</button>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 text-left">
          {[
            { k: "Predict", v: "Risk model + 8,173 incidents" },
            { k: "Plan",    v: "Diversions + resource roll-up" },
            { k: "Deploy",  v: "Command center · live ops" },
          ].map((c) => (
            <div key={c.k} className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-primary">{c.k}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SCENE CARD — swaps content per act with fade-in animation
// ----------------------------------------------------------------------------
function SceneCard({
  act, progress, prediction, diversions,
}: {
  act: Act; progress: number;
  prediction: ReturnType<typeof predictImpact>;
  diversions: ReturnType<typeof diversionRoutesFor>;
}) {
  return (
    <div key={act.id} className="flex flex-col h-full animate-fade-in">
      <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
        <act.Icon className="size-4 text-primary" />
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">{act.label}</div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {act.id === "title"    && <SceneTitle />}
        {act.id === "intel"    && <SceneIntel progress={progress} />}
        {act.id === "predict"  && <ScenePredict progress={progress} prediction={prediction} />}
        {act.id === "simulate" && <SceneSimulate progress={progress} prediction={prediction} />}
        {act.id === "impact"   && <SceneImpact prediction={prediction} progress={progress} />}
        {act.id === "divert"   && <SceneDivert diversions={diversions} progress={progress} />}
        {act.id === "deploy"   && <SceneDeploy progress={progress} prediction={prediction} />}
        {act.id === "command"  && <SceneCommand prediction={prediction} />}
        {act.id === "report"   && <SceneReport prediction={prediction} />}
      </div>
    </div>
  );
}

function SceneTitle() {
  return (
    <div className="h-full grid place-items-center text-center">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">Smart City Operating System</div>
        <h2 className="text-3xl font-semibold mt-3">Predict · Plan · Deploy · Learn</h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">
          The same loop a Traffic Commissioner runs in the war room, compressed into 90 seconds.
        </p>
      </div>
    </div>
  );
}

function SceneIntel({ progress }: { progress: number }) {
  const lines = [
    { t: "0.0", k: "INGEST",   v: "BBMP events feed · 1 new entry" },
    { t: "0.2", k: "PARSE",    v: "RCB vs CSK · IPL Final" },
    { t: "0.4", k: "GEOCODE",  v: "M. Chinnaswamy Stadium · 12.9788°N, 77.5996°E" },
    { t: "0.5", k: "CROWD",    v: "Capacity 42,000 · 6h window" },
    { t: "0.7", k: "WEATHER",  v: "Clear · 24°C · low rain risk" },
    { t: "0.9", k: "LOCK",     v: "Event registered as EVT-IPL-001" },
  ];
  const shown = lines.filter((_, i) => progress >= i / lines.length);
  return (
    <ul className="space-y-2 font-mono text-[12px]">
      {shown.map((l, i) => (
        <li key={i} className="flex gap-3 animate-fade-in">
          <span className="text-muted-foreground w-10">+{l.t}s</span>
          <span className="text-primary w-20">{l.k}</span>
          <span className="text-foreground/90 flex-1">{l.v}</span>
        </li>
      ))}
    </ul>
  );
}

function ScenePredict({ progress, prediction }: { progress: number; prediction: ReturnType<typeof predictImpact> }) {
  const score = Math.round(prediction.riskScore * Math.min(1, progress * 1.2));
  const band = riskBand(score);
  return (
    <div className="grid grid-cols-12 gap-4 items-center">
      <div className="col-span-5 grid place-items-center">
        <RiskGauge score={score} />
      </div>
      <div className="col-span-7">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Predicted band</div>
        <div className="text-xl font-semibold mt-1" style={{ color: band.color }}>{band.label}</div>
        <div className="mt-3 space-y-1.5">
          {prediction.reasoning.slice(0, 4).map((r, i) => (
            progress >= (i + 1) / 6 && (
              <div key={i} className="flex gap-2 text-[12px] animate-fade-in">
                <span style={{ color: band.color }}>›</span>
                <span className="text-foreground/85">{r}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneSimulate({ progress, prediction }: { progress: number; prediction: ReturnType<typeof predictImpact> }) {
  const tiles = [
    { k: "Delay added",      v: `+${Math.round(prediction.delayMinutes * progress)} min` },
    { k: "Impact radius",    v: `${(prediction.impactRadiusKm * progress).toFixed(1)} km` },
    { k: "Throughput drop",  v: `-${Math.round(38 * progress)}%` },
    { k: "Spillback",        v: `${Math.round(progress * 4)} corridors` },
  ];
  return (
    <div className="space-y-3">
      <div className="text-[11px] text-muted-foreground">Propagating demand on a graph of {prediction.affectedJunctions.length + 7} junctions…</div>
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map((t) => (
          <div key={t.k} className="rounded-md border border-border/60 bg-card/40 p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t.k}</div>
            <div className="text-lg font-semibold mt-1 tabular-nums">{t.v}</div>
          </div>
        ))}
      </div>
      <div className="h-2 rounded-full bg-border/40 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-amber-400" style={{ width: `${progress * 100}%`, transition: "none" }} />
      </div>
      <div className="text-[11px] font-mono text-primary">SIM · {Math.round(progress * 100)}%</div>
    </div>
  );
}

function SceneImpact({ prediction, progress }: { prediction: ReturnType<typeof predictImpact>; progress: number }) {
  const peopleHours = Math.round(38_000 * progress);
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-warning/40 bg-warning/10 p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-warning">Citizen impact</div>
        <div className="text-2xl font-semibold mt-1 tabular-nums">{peopleHours.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">people-hours at risk</span></div>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Affected corridors</div>
        <ul className="mt-1.5 text-[13px] space-y-1">
          {prediction.affectedCorridors.slice(0, 4).map((c, i) => (
            progress >= (i + 1) / 6 && (
              <li key={c} className="flex justify-between animate-fade-in border-b border-border/40 pb-1">
                <span>{c}</span>
                <span className="text-muted-foreground font-mono text-[11px]">tier {i + 1}</span>
              </li>
            )
          ))}
        </ul>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Critical junctions</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {prediction.affectedJunctions.slice(0, 6).map((j, i) => (
            progress >= (i + 1) / 8 && (
              <span key={j} className="animate-fade-in text-[11px] px-2 py-0.5 rounded border border-border bg-card/50">{j}</span>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneDivert({ diversions, progress }: { diversions: ReturnType<typeof diversionRoutesFor>; progress: number }) {
  return (
    <div className="space-y-2.5">
      {diversions.slice(0, 3).map((d, i) => (
        progress >= i / 3.5 && (
          <div key={d.id} className="animate-fade-in rounded-md border border-border/60 bg-card/40 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <RouteIcon className="size-3.5 text-primary" />
                {d.name}
                {d.recommended && (
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30">Recommended</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">+{d.extraMinutes} min</span>
            </div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">Covers: {d.coverage.join(" · ")}</div>
            <div className="mt-2 h-1.5 rounded-full bg-border/40 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${d.capacityPct}%` }} />
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">Absorbs {d.capacityPct}% of demand</div>
          </div>
        )
      ))}
    </div>
  );
}

function SceneDeploy({ progress, prediction }: { progress: number; prediction: ReturnType<typeof predictImpact> }) {
  const cards = [
    { k: "Officers",   v: prediction.recommendedOfficers,   icon: Users },
    { k: "Barricades", v: prediction.recommendedBarricades, icon: Shield },
    { k: "Patrols",    v: Math.max(2, Math.round(prediction.recommendedOfficers / 4)), icon: Radio },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {cards.map(({ k, v, icon: Icon }) => (
          <div key={k} className="rounded-md border border-border/60 bg-card/40 p-3 text-center">
            <Icon className="size-4 text-primary mx-auto" />
            <div className="text-2xl font-semibold mt-1 tabular-nums">{Math.round(v * Math.min(1, progress * 1.1))}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{k}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-border/60 bg-card/40 p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Deployment plan</div>
        <ul className="mt-1.5 text-[12px] space-y-1">
          {[
            "12 officers · Chinnaswamy north & east gates",
            "8 officers · MG Road / Trinity junction",
            "6 officers · Cubbon Park ring",
            "4 barricade clusters · diversion entry points",
            "2 patrol units · ORR ramp monitoring",
          ].map((l, i) => (
            progress >= (i + 1) / 7 && (
              <li key={l} className="flex gap-2 animate-fade-in"><span className="text-success">▸</span><span>{l}</span></li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}

function SceneCommand({ prediction }: { prediction: ReturnType<typeof predictImpact> }) {
  const feed = [
    { t: "00:00", v: "Command center activated · 26 units online" },
    { t: "00:04", v: "MG Road camera #14 — flow nominal" },
    { t: "00:08", v: "Trinity junction barricade live" },
    { t: "00:12", v: "ORR East ramp meter armed" },
    { t: "00:16", v: "Gate B inflow 1,200 pax/min — within plan" },
    { t: "00:21", v: "Patrol P-3 reroute confirmed via north bypass" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Units", v: "26", tone: "var(--primary)" },
          { k: "Cameras", v: "48", tone: "oklch(0.80 0.16 60)" },
          { k: "Risk", v: `${prediction.riskScore}`, tone: riskBand(prediction.riskScore).color },
        ].map((m) => (
          <div key={m.k} className="rounded-md border border-border/60 bg-card/40 p-2.5">
            <div className="text-xl font-semibold tabular-nums" style={{ color: m.tone }}>{m.v}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.k}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-border/60 bg-[oklch(0.08_0.02_250)] p-3 font-mono text-[11px] space-y-1">
        {feed.map((f, i) => (
          <div key={i} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 90}ms` }}>
            <span className="text-primary">{f.t}</span>
            <span className="text-foreground/85">{f.v}</span>
          </div>
        ))}
        <div className="flex gap-3 text-success">
          <span className="size-1.5 rounded-full bg-success self-center animate-pulse" />
          <span>Heartbeat live · 2s tick</span>
        </div>
      </div>
    </div>
  );
}

function SceneReport({ prediction }: { prediction: ReturnType<typeof predictImpact> }) {
  const actualDelay = Math.round(prediction.delayMinutes * 0.55);
  const saved = prediction.delayMinutes - actualDelay;
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-success/40 bg-success/10 p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-success">Event closed</div>
        <div className="text-base font-medium mt-1">RCB vs CSK · IPL Final · 6h 04m</div>
        <div className="text-xs text-muted-foreground mt-0.5">Predicted vs Actual reconciled</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Predicted risk" v={`${prediction.riskScore}`} />
        <Stat label="Actual risk" v={`${Math.round(prediction.riskScore * 0.92)}`} accent="success" />
        <Stat label="Delay avoided" v={`${saved} min`} accent="success" />
        <Stat label="People-hours saved" v={`${(saved * 700).toLocaleString()}`} accent="success" />
      </div>
      <div className="rounded-md border border-border/60 bg-card/40 p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Learn loop</div>
        <div className="text-[12px] mt-1.5 text-foreground/85">
          Model v1.3 held within ±5 points on risk and ±3 min on delay. Re-weighting Chinnaswamy + MG Road priors → v1.4 queued for next cycle.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, v, accent }: { label: string; v: string; accent?: "success" | "warning" }) {
  const c = accent === "success" ? "text-success" : accent === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md border border-border/60 bg-card/40 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold mt-0.5 tabular-nums ${c}`}>{v}</div>
    </div>
  );
}

function CtrlButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} title={label}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 hover:bg-card text-foreground/80 hover:text-foreground px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider">
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );
}
