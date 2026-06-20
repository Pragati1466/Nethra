import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { CityMap } from "@/components/nethra/CityMap";
import { RiskGauge, MetricStat } from "@/components/nethra/RiskGauge";
import { addEvent, predictImpact, riskBand } from "@/lib/intel";
import { CheckCircle2, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({ meta: [{ title: "One-Click Demo · NETHRA" }, { name: "description", content: "Watch NETHRA simulate a complete event lifecycle from prediction to after-action report." }] }),
  component: DemoPage,
});

const STAGES = [
  "Stage event: India vs Pakistan, Chinnaswamy Stadium",
  "Predict impact from 8,173 historical incidents",
  "Generate smart diversions for ORR East / MG Road",
  "Recommend officer & barricade deployment",
  "Activate command center & live monitoring",
  "Compile after-action report",
] as const;

const DEMO_EVENT = {
  name: "India vs Pakistan · Asia Cup Final",
  kind: "cricket" as const,
  lat: 12.9788, lng: 77.5996,
  address: "M. Chinnaswamy Stadium, Cubbon Park, Bengaluru",
  crowd: 42000, durationHours: 6,
};

function DemoPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(-1);
  const [running, setRunning] = useState(false);
  const prediction = predictImpact(DEMO_EVENT);

  useEffect(() => {
    if (!running) return;
    if (stage >= STAGES.length - 1) { setRunning(false); return; }
    const t = setTimeout(() => setStage((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [running, stage]);

  function start() { setStage(0); setRunning(true); }

  function finalize() {
    const id = "EVT-" + Math.floor(2000 + Math.random() * 8000);
    addEvent({
      id, ...DEMO_EVENT,
      startsAt: new Date(Date.now() + 3 * 3600e3).toISOString(),
      status: "live", createdAt: new Date().toISOString(),
    });
    navigate({ to: "/events/$eventId", params: { eventId: id } });
  }

  const band = riskBand(prediction.riskScore);

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">One-Click Demo</div>
            <h1 className="text-2xl font-semibold mt-1">Full operational lifecycle, in 7 seconds</h1>
            <p className="text-sm text-muted-foreground mt-1">Watch NETHRA stage an event, predict impact, plan deployment, and activate the command center end-to-end.</p>
          </div>
          {stage < 0 ? (
            <button onClick={start} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
              <PlayCircle className="size-4" /> Run Demo
            </button>
          ) : !running && stage >= STAGES.length - 1 ? (
            <button onClick={finalize} className="inline-flex items-center gap-2 rounded-md bg-success text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90">
              <CheckCircle2 className="size-4" /> Open in Command Center
            </button>
          ) : (
            <Badge tone="warning">Running…</Badge>
          )}
        </div>

        <Panel title="Live Simulation" className="col-span-12 lg:col-span-8 h-[520px] flex flex-col">
          <div className="flex-1 p-2">
            <CityMap
              events={stage >= 0 ? [{ id: "demo", name: DEMO_EVENT.name, kind: DEMO_EVENT.kind, lat: DEMO_EVENT.lat, lng: DEMO_EVENT.lng, address: DEMO_EVENT.address, crowd: DEMO_EVENT.crowd, durationHours: DEMO_EVENT.durationHours, startsAt: new Date().toISOString(), status: stage >= 4 ? "live" : "planned", createdAt: new Date().toISOString() }] : []}
              focus={stage >= 1 ? { lat: DEMO_EVENT.lat, lng: DEMO_EVENT.lng, impactRadiusKm: prediction.impactRadiusKm, riskScore: prediction.riskScore } : null}
            />
          </div>
        </Panel>

        <Panel title="Pipeline" className="col-span-12 lg:col-span-4">
          <div className="p-4 space-y-2">
            {STAGES.map((s, i) => {
              const state = stage < i ? "idle" : stage === i && running ? "active" : "done";
              return (
                <div key={i} className={`flex items-start gap-3 p-2.5 rounded-md border transition ${
                  state === "done" ? "border-success/40 bg-success/5" :
                  state === "active" ? "border-primary/50 bg-primary/10" :
                  "border-border bg-card/30 opacity-60"
                }`}>
                  <div className={`size-5 rounded-full grid place-items-center text-[10px] font-mono ${
                    state === "done" ? "bg-success text-primary-foreground" :
                    state === "active" ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>{i + 1}</div>
                  <div className="text-sm">{s}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        {stage >= 1 && (
          <Panel title="After-Action Report" className="col-span-12">
            <div className="p-4 grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3 grid place-items-center">
                <RiskGauge score={prediction.riskScore} />
              </div>
              <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-3 self-center">
                <MetricStat label="Crowd" value={DEMO_EVENT.crowd.toLocaleString()} tone="info" />
                <MetricStat label="Delay saved" value={`${Math.round(prediction.delayMinutes * 0.45)} min`} tone="success" />
                <MetricStat label="Officers deployed" value={prediction.recommendedOfficers} />
                <MetricStat label="Diversions live" value={prediction.diversions.length} sub="corridor-level" />
              </div>
              <div className="col-span-12 md:col-span-4 text-sm space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Reasoning</div>
                {prediction.reasoning.slice(0, 4).map((r, i) => (
                  <div key={i} className="flex gap-2 text-[13px]"><span style={{ color: band.color }}>›</span><span className="text-foreground/80">{r}</span></div>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
