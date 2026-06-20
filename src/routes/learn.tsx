import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { MetricStat } from "@/components/nethra/RiskGauge";
import { learnRecords } from "@/lib/intel";
import { Brain, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn Loop · NETHRA" }] }),
  component: LearnPage,
});

function LearnPage() {
  const records = learnRecords();
  const accuracy = Math.round(
    (records.filter((r) => Math.abs(r.predictedRisk - r.actualRisk) <= 8).length / records.length) * 100,
  );
  const avgDelta = Math.round(
    records.reduce((s, r) => s + Math.abs(r.predictedRisk - r.actualRisk), 0) / records.length,
  );

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Learn Loop</div>
          <h1 className="text-2xl font-semibold mt-1">Every closed event sharpens tomorrow's prediction</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Predicted vs actual outcomes. NETHRA re-weights corridor and cause priors after each outcome.
          </p>
        </div>

        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricStat label="Closed cases" value={records.length} sub="last 24h" />
          <MetricStat label="Risk accuracy" value={`${accuracy}%`} tone="success" sub="within ±8 points" />
          <MetricStat label="Avg Δ risk" value={avgDelta} tone="warning" sub="absolute" />
          <MetricStat label="Re-tunings" value={records.filter((r) => Math.abs(r.predictedRisk - r.actualRisk) > 8).length} tone="info" sub="priors updated" />
        </div>

        <Panel title="Predicted vs Actual" className="col-span-12">
          <div className="divide-y divide-border">
            {records.map((r) => {
              const delta = r.actualRisk - r.predictedRisk;
              const accurate = Math.abs(delta) <= 8;
              return (
                <div key={r.id} className="p-4 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 lg:col-span-4">
                    <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
                    <div className="text-sm font-medium mt-0.5 capitalize">{r.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Brain className="size-3 text-primary" /> {r.notes}
                    </div>
                  </div>
                  <KpiBar label="Risk" pred={r.predictedRisk} act={r.actualRisk} unit="" />
                  <KpiBar label="Delay" pred={r.predictedDelayMin} act={r.actualDelayMin} unit="min" />
                  <KpiBar label="Officers" pred={r.predictedOfficers} act={r.actualOfficers} unit="" />
                  <div className="col-span-12 lg:col-span-2 flex lg:justify-end items-center gap-2">
                    <Badge tone={accurate ? "success" : "warning"}>
                      {accurate ? "on target" : "re-tuned"}
                    </Badge>
                    <span className="font-mono text-xs inline-flex items-center gap-0.5" style={{ color: delta >= 0 ? "var(--critical)" : "var(--success)" }}>
                      {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} Δ {delta > 0 ? "+" : ""}{delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function KpiBar({ label, pred, act, unit }: { label: string; pred: number; act: number; unit: string }) {
  const max = Math.max(pred, act, 1);
  return (
    <div className="col-span-6 lg:col-span-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="space-y-1">
        <Row color="oklch(0.65 0.18 220)" pct={(pred / max) * 100} label={`${pred}${unit}`} tag="pred" />
        <Row color="oklch(0.72 0.18 30)" pct={(act / max) * 100} label={`${act}${unit}`} tag="act" />
      </div>
    </div>
  );
}
function Row({ color, pct, label, tag }: { color: string; pct: number; label: string; tag: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono">
      <span className="w-7 text-muted-foreground">{tag}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-12 text-right">{label}</span>
    </div>
  );
}
