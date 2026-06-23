import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { CityMap } from "@/components/nethra/CityMap";
import { getEvents, predictImpact, riskBand } from "@/lib/intel";
import { getLatestClosedIntel, setLatestClosedIntel, deriveCeifromTiwClosure } from "@/lib/closed_intel_store";
import { getTiwForEvent } from "@/lib/tiw_store";

import { Pause, Play, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/replay")({
  head: () => ({ meta: [{ title: "Decision Replay · NETHRA" }, { name: "description", content: "Replay incident timelines and reconstruct decisions step by step." }] }),
  component: ReplayPage,
});

const TIMELINE = [
  { t: -120, label: "Event created", detail: "Operator stages event in NETHRA" },
  { t: -90,  label: "Impact predicted", detail: "Risk score and affected corridors computed from 8K historical incidents" },
  { t: -75,  label: "Diversion plan generated", detail: "3 corridor-level alternates published" },
  { t: -60,  label: "Resource recommendation approved", detail: "Officers and barricades assigned to lead stations" },
  { t: -30,  label: "Deployment confirmed", detail: "Units acknowledge positions" },
  { t: 0,    label: "Event goes live", detail: "Monitoring begins" },
  { t: 30,   label: "Congestion spike absorbed", detail: "Diversions diverted ~22% of inbound traffic" },
  { t: 90,   label: "Event closes", detail: "After-action report generated" },
];

function ReplayPage() {
  const events = getEvents();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const event = events[0];
  const prediction = useMemo(
    () => event ? predictImpact({ kind: event.kind, lat: event.lat, lng: event.lng, crowd: event.crowd, durationHours: event.durationHours }) : null,
    [event],
  );

  // Auto-advance
  useState(() => {
    let h: ReturnType<typeof setInterval> | null = null;
    if (playing) h = setInterval(() => setStep((s) => Math.min(TIMELINE.length - 1, s + 1)), 1200);
    return () => { if (h) clearInterval(h); };
  });

  if (!event || !prediction) return <AppShell><div className="p-10 text-muted-foreground">No events to replay yet.</div></AppShell>;
  const band = riskBand(prediction.riskScore);
  const twForEvent = getTiwForEvent(event.id);
  const closed = getLatestClosedIntel();

  const current = TIMELINE[step];
  const beforeRadius = prediction.impactRadiusKm * 1.6;
  const afterRadius = prediction.impactRadiusKm * 0.7;
  const shownRadius = step < 4 ? beforeRadius : step < 7 ? prediction.impactRadiusKm : afterRadius;

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Decision Replay</div>
          <h1 className="text-2xl font-semibold mt-1">{event.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Scrub through the operational timeline to reconstruct every decision and learn from outcomes.</p>
        </div>

        <Panel className="col-span-12 lg:col-span-8 h-[480px] flex flex-col">
          <div className="flex-1 p-2">
            <CityMap events={[event]} focus={{ lat: event.lat, lng: event.lng, impactRadiusKm: shownRadius, riskScore: prediction.riskScore }} />
          </div>
        </Panel>

        <Panel title={current.label} subtitle={`T ${current.t >= 0 ? "+" : ""}${current.t} min`} className="col-span-12 lg:col-span-4">
          <div className="p-4 space-y-3">
            <p className="text-sm text-foreground/80">{current.detail}</p>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground pt-2">Before vs After</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border bg-card/50 p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Before</div>
                <div className="font-mono text-xl mt-1 text-warning">{Math.round(prediction.delayMinutes * 1.4)} min</div>
                <div className="text-[11px] text-muted-foreground">avg delay (no plan)</div>
              </div>
              <div className="rounded-md border border-border bg-card/50 p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">After</div>
                <div className="font-mono text-xl mt-1 text-success">{closed?.actualDelayMin ?? Math.round(prediction.delayMinutes * 0.65)} min</div>
                <div className="text-[11px] text-muted-foreground">with NETHRA plan</div>
              </div>

            </div>
            <Badge tone={band.tone}>Peak risk {prediction.riskScore}</Badge>
            {step === TIMELINE.length - 1 && closed && (

              <div className="mt-3 rounded-md border border-success/30 bg-success/5 p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-success">Final Outcome</div>
                <div className="mt-1 text-sm text-foreground/85">Actual Delay: {closed.actualDelayMin} min · Learned: {closed.learnedUpdate}</div>
              </div>
            )}

          </div>
        </Panel>

        <Panel title="Timeline" className="col-span-12">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setPlaying((p) => !p)} className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium">
                {playing ? <Pause className="size-3.5"/> : <Play className="size-3.5"/>}{playing ? "Pause" : "Play"}
              </button>
              <button onClick={() => { setStep(0); setPlaying(false); }} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/40 px-3 py-1.5 text-sm">
                <RotateCcw className="size-3.5"/>Reset
              </button>
              <span className="text-xs font-mono text-muted-foreground ml-auto">Step {step + 1} / {TIMELINE.length}</span>
            </div>
            <input
              type="range" min={0} max={TIMELINE.length - 1} value={step}
              onChange={(e) => setStep(+e.target.value)} className="w-full accent-[var(--primary)]"
            />
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {TIMELINE.map((t, i) => (
                <button key={i} onClick={() => setStep(i)}
                  className={`text-left text-[11px] p-2 rounded-md border transition ${i === step ? "border-primary bg-primary/15" : "border-border bg-card/40 hover:bg-accent/40"}`}>
                  <div className="font-mono text-muted-foreground">T{t.t >= 0 ? "+" : ""}{t.t}</div>
                  <div className="truncate">{t.label}</div>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
