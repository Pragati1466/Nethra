// NETHRA Explainable Intelligence panel — turns a Prediction + Explanation
// into a defensible "why" view: factor decomposition, similar past outcomes,
// junction DNA, and diversion rationale. Pure presentational.
import { Panel, Badge } from "@/components/nethra/AppShell";
import type { Explanation, Factor, JunctionDNA, SimilarOutcome, DiversionRationale } from "@/lib/intel";
import { ArrowDownRight, ArrowUpRight, Brain, History, MapPin, Route as RouteIcon, ShieldAlert, Sparkles } from "lucide-react";

const sourceTone: Record<Factor["source"], "info" | "warning" | "success" | "muted"> = {
  historical: "warning",
  event: "info",
  context: "success",
  model: "muted",
};

export function ExplainabilityPanel({ explanation, className }: { explanation: Explanation; className?: string }) {
  return (
    <Panel
      title="Explainable Intelligence"
      subtitle={explanation.headline}
      className={className}
      action={
        <div className="flex items-center gap-2">
          <Badge tone="info">conf {explanation.confidence}%</Badge>
          <Badge tone="muted">{explanation.evidenceCount} incidents reviewed</Badge>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-border">
        {/* Left column — bullets + factors */}
        <div className="p-4 space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" /> Because
            </div>
            <ul className="space-y-1.5 text-[13px]">
              {explanation.bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary mt-0.5">›</span>
                  <span className="text-foreground/85">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Brain className="size-3 text-primary" /> Top contributing factors
            </div>
            <div className="space-y-2">
              {explanation.factors.map((f) => (
                <FactorBar key={f.id} f={f} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column — similar incidents + junction DNA */}
        <div className="p-4 space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <History className="size-3 text-primary" /> Historical evidence
            </div>
            {explanation.similar.length ? (
              <div className="space-y-1.5">
                {explanation.similar.slice(0, 4).map((s) => (
                  <SimilarRow key={s.id} s={s} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No closely matched historical incidents.</p>
            )}
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <MapPin className="size-3 text-primary" /> Junction DNA
            </div>
            {explanation.junctionDNA.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {explanation.junctionDNA.map((j) => (
                  <JunctionCard key={j.name} j={j} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No junction-level concentration detected.</p>
            )}
          </div>
        </div>
      </div>

      {explanation.diversion && (
        <div className="border-t border-border p-4">
          <DiversionRationaleView d={explanation.diversion} />
        </div>
      )}
    </Panel>
  );
}

function FactorBar({ f }: { f: Factor }) {
  const Arrow = f.direction === "up" ? ArrowUpRight : ArrowDownRight;
  const color = f.direction === "up" ? "var(--critical)" : "var(--success)";
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <Arrow className="size-3.5" style={{ color }} />
          <span className="font-medium">{f.label}</span>
          <Badge tone={sourceTone[f.source]} className="ml-1 !py-0">{f.source}</Badge>
        </span>
        <span className="font-mono text-xs text-muted-foreground">{f.weight}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
        <div className="h-full rounded-full" style={{ width: `${Math.max(3, f.weight)}%`, background: color }} />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{f.evidence}</p>
    </div>
  );
}

function SimilarRow({ s }: { s: SimilarOutcome }) {
  return (
    <div className="rounded-md border border-border bg-card/50 p-2.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="capitalize truncate text-[13px]">{s.title}</div>
        <Badge tone={s.match >= 75 ? "warning" : "muted"}>{s.match}% match</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-muted-foreground mt-1">
        <span>delay {s.delayMin} min</span>
        <span>peak risk {s.riskAtPeak}</span>
        <span>{s.distanceKm} km away</span>
        {s.closure && <span className="text-critical">closure</span>}
      </div>
    </div>
  );
}

function JunctionCard({ j }: { j: JunctionDNA }) {
  return (
    <div className="rounded-md border border-border bg-card/50 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[13px] font-medium truncate">{j.name}</div>
        <span className="font-mono text-xs" style={{ color: j.riskIndex >= 75 ? "var(--critical)" : j.riskIndex >= 55 ? "var(--warning)" : "var(--info)" }}>
          {j.riskIndex}
        </span>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
        <div className="capitalize">Top cause: {j.topCause}</div>
        <div className="font-mono">{j.incidentCount} incidents · peak {j.peakHour} · closures {(j.closureRate * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
}

function DiversionRationaleView({ d }: { d: DiversionRationale }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <RouteIcon className="size-4 text-primary" />
        <div className="text-sm font-medium">Why &ldquo;{d.routeName}&rdquo; was chosen</div>
        <Badge tone="success">fit score {d.score}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
        <div className="rounded-md border border-success/30 bg-success/5 p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-success mb-1">Pros</div>
          <ul className="space-y-1">
            {d.pros.map((p, i) => <li key={i} className="flex gap-1.5"><span className="text-success">+</span><span className="text-foreground/85">{p}</span></li>)}
          </ul>
        </div>
        <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-warning mb-1 flex items-center gap-1"><ShieldAlert className="size-3" /> Cons</div>
          <ul className="space-y-1">
            {d.cons.map((p, i) => <li key={i} className="flex gap-1.5"><span className="text-warning">!</span><span className="text-foreground/85">{p}</span></li>)}
          </ul>
        </div>
        <div className="rounded-md border border-border bg-card/40 p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Alternates rejected</div>
          <ul className="space-y-1">
            {d.rejected.map((r) => (
              <li key={r.id} className="flex gap-1.5"><span className="text-muted-foreground">×</span><span className="text-foreground/80"><span className="font-medium">{r.name}</span> — {r.reason}</span></li>
            ))}
            {!d.rejected.length && <li className="text-muted-foreground">Single viable route generated.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
