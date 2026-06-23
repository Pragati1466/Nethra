import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { CityMap } from "@/components/nethra/CityMap";
import { RiskGauge, MetricStat } from "@/components/nethra/RiskGauge";
import { EVENT_KINDS, type EventKindId, addEvent, predictImpact, riskBand } from "@/lib/intel";
import { CheckCircle2, MapPin, Redo2, Sparkles, Undo2, Users } from "lucide-react";
import { toast } from "sonner";
import { useFormHistory } from "@/hooks/use-form-history";

export const Route = createFileRoute("/events/new")({
  head: () => ({
    meta: [
      { title: "Create Event · NETHRA" },
      { name: "description", content: "Create an upcoming traffic event — festival, rally, match, VIP movement, construction — and predict its impact instantly." },
    ],
  }),
  component: NewEvent,
});

type FormState = {
  name: string;
  kind: EventKindId;
  crowd: number;
  hours: number;
  startsAt: string;
  address: string;
  pin: { lat: number; lng: number } | null;
};

function NewEvent() {
  const navigate = useNavigate();

  const { state, set, undo, redo, canUndo, canRedo, historySize } = useFormHistory<FormState>({
    name: "",
    kind: "festival",
    crowd: 15000,
    hours: 4,
    startsAt: new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 16),
    address: "",
    pin: null,
  });

  const { name, kind, crowd, hours, startsAt, address, pin } = state;

  const prediction = useMemo(
    () => pin ? predictImpact({ kind, lat: pin.lat, lng: pin.lng, crowd, durationHours: hours }) : null,
    [pin, kind, crowd, hours],
  );
  const band = prediction ? riskBand(prediction.riskScore) : null;

  function handlePick(lat: number, lng: number) {
    set({
      pin: { lat, lng },
      address: state.address || `${lat.toFixed(4)}, ${lng.toFixed(4)} · Bengaluru`,
    });
  }

  function handleCreate() {
    if (!pin || !name) return;
    const id = "EVT-" + Math.floor(2000 + Math.random() * 8000);
    addEvent({
      id, name, kind, lat: pin.lat, lng: pin.lng, address,
      crowd, durationHours: hours, startsAt: new Date(startsAt).toISOString(),
      status: "planned", createdAt: new Date().toISOString(),
    });
    toast.success("Event created successfully", {
      description: `${name} has been staged and operational plan is ready.`,
    });
    navigate({ to: "/events/$eventId", params: { eventId: id } });
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Event Creation Center</div>
            <h1 className="text-2xl font-semibold mt-1">Stage an upcoming event</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Click the map to drop a pin, fill in the details, and NETHRA will instantly predict impact, recommend deployment, and stage operational plans.
            </p>
          </div>

          {/* Undo / Redo controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              title={canUndo ? `Undo (${historySize} step${historySize !== 1 ? "s" : ""} available) · Ctrl+Z` : "Nothing to undo"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Undo2 className="size-3.5" />
              Undo
              {canUndo && (
                <span className="ml-0.5 px-1 py-0 rounded bg-muted text-[10px] font-mono">{historySize}</span>
              )}
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title={canRedo ? "Redo · Ctrl+Shift+Z" : "Nothing to redo"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Redo2 className="size-3.5" />
              Redo
            </button>
            <span className="text-[10px] font-mono text-muted-foreground/50 pl-1 hidden sm:block">
              Ctrl+Z · Ctrl+Shift+Z
            </span>
          </div>
        </div>

        <Panel title="1 · Pick location" subtitle="Click the map" className="col-span-12 lg:col-span-7 h-[560px] flex flex-col">
          <div className="flex-1 p-2">
            <CityMap onPick={handlePick} focus={pin && prediction ? { lat: pin.lat, lng: pin.lng, impactRadiusKm: prediction.impactRadiusKm, riskScore: prediction.riskScore } : null} />
          </div>
        </Panel>

        <Panel title="2 · Event details" className="col-span-12 lg:col-span-5">
          <div className="p-4 space-y-4">
            <Field label="Event name">
              <input
                value={name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="e.g. Republic Day Parade"
                className={inputCls}
              />
            </Field>
            <Field label="Type">
              <select
                value={kind}
                onChange={(e) => set({ kind: e.target.value as EventKindId })}
                className={inputCls}
              >
                {EVENT_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <div className="flex gap-2">
                <input
                  value={address}
                  onChange={(e) => set({ address: e.target.value })}
                  placeholder="Drop a pin on the map"
                  className={inputCls}
                />
                <div className="grid place-items-center px-3 rounded-md border border-border bg-card/40">
                  <MapPin className={`size-4 ${pin ? "text-success" : "text-muted-foreground"}`} />
                </div>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expected crowd">
                <div className="relative">
                  <input
                    type="number" min={0} step={500}
                    value={crowd}
                    onChange={(e) => set({ crowd: +e.target.value })}
                    className={inputCls + " pl-8"}
                  />
                  <Users className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>
              <Field label="Duration (hours)">
                <input
                  type="number" min={1} max={72}
                  value={hours}
                  onChange={(e) => set({ hours: +e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Starts at">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => set({ startsAt: e.target.value })}
                className={inputCls}
              />
            </Field>
            <button
              disabled={!pin || !name}
              onClick={handleCreate}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-3.5 py-2.5 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="size-4" /> Create & open operational plan
            </button>
          </div>
        </Panel>

        {/* Live prediction */}
        <Panel
          title="3 · Live impact prediction"
          subtitle={pin ? "Refines as you edit details" : "Drop a pin to begin"}
          action={prediction ? <Badge tone={band?.tone ?? "info"}>Confidence {prediction.confidence}%</Badge> : null}
          className="col-span-12"
        >
          {!prediction ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              <Sparkles className="size-6 mx-auto mb-2 text-muted-foreground/60" />
              Pick a location on the map to see predicted risk, affected corridors, and recommended deployment.
            </div>
          ) : (
            <div className="p-4 grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3 grid place-items-center">
                <RiskGauge score={prediction.riskScore} />
              </div>
              <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-3 self-center">
                <MetricStat label="Impact radius" value={`${prediction.impactRadiusKm} km`} tone="info" />
                <MetricStat label="Expected delay" value={`${prediction.delayMinutes} min`} tone="warning" />
                <MetricStat label="Officers needed" value={prediction.recommendedOfficers} sub="recommended" />
                <MetricStat label="Barricades" value={prediction.recommendedBarricades} sub="recommended" />
              </div>
              <div className="col-span-12 md:col-span-4 space-y-2 text-sm">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Why this score</div>
                <ul className="space-y-1.5 text-[13px]">
                  {prediction.reasoning.map((r, i) => (
                    <li key={i} className="flex gap-2"><span className="text-primary mt-0.5">›</span><span className="text-foreground/80">{r}</span></li>
                  ))}
                </ul>
              </div>
              <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <Chips label="Affected junctions" items={prediction.affectedJunctions} />
                <Chips label="Stress corridors" items={prediction.affectedCorridors} />
                <Chips label="Responding stations" items={prediction.affectedStations} />
              </div>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

const inputCls = "w-full rounded-md bg-input/60 border border-border px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Chips({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.length ? items.map((x) => (
          <span key={x} className="text-[12px] px-2 py-1 rounded-md bg-accent/50 border border-border">{x}</span>
        )) : <span className="text-xs text-muted-foreground">—</span>}
      </div>
    </div>
  );
}
