import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { MetricStat } from "@/components/nethra/RiskGauge";
import {
  learnRecords,
  predVsActualSeries,
  weeklyPerformance,
  calibrationBins,
  historicalLedger,
  learningSummary,
} from "@/lib/intel";
import { Brain, TrendingDown, TrendingUp, GitBranch, Activity, Target, Workflow } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, LineChart, ReferenceLine, Area, AreaChart, Legend,
} from "recharts";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning Dashboard · NETHRA" },
      { name: "description", content: "How NETHRA's forecast model improves after every event — accuracy, calibration, drift, and historical performance." },
    ],
  }),
  component: LearnPage,
});

const C_PRED = "oklch(0.65 0.18 220)";
const C_ACT = "oklch(0.72 0.18 30)";
const C_OK = "oklch(0.72 0.18 150)";
const C_WARN = "oklch(0.78 0.16 75)";

function LearnPage() {
  const summary = learningSummary();
  const scatter = predVsActualSeries();
  const weekly = weeklyPerformance();
  const calib = calibrationBins();
  const ledger = historicalLedger(14);
  const records = learnRecords();

  // Scatter domain & ideal y=x reference points
  const maxDelay = Math.max(...scatter.map((s) => Math.max(s.predictedDelayMin, s.actualDelayMin))) + 5;
  const identity = [{ predictedDelayMin: 0, actualDelayMin: 0 }, { predictedDelayMin: maxDelay, actualDelayMin: maxDelay }];

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4">
        {/* Header */}
        <div className="col-span-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Learning Dashboard</div>
            <h1 className="text-2xl font-semibold mt-1">NETHRA sharpens with every closed event</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Predicted vs actual delay, forecast accuracy, calibration drift, and the learning trend across the last 12 weeks.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <GitBranch className="size-3.5 text-primary" />
            <span>{summary.modelVersion}</span>
            <span className="text-border">·</span>
            <span>{summary.eventsLearned} events trained</span>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricStat label="Forecast accuracy" value={`${summary.overallAccuracy}%`} tone="success" sub="within ±5 min" />
          <MetricStat label="Mean abs error" value={`${summary.mae} min`} tone="info" sub="delay forecast" />
          <MetricStat label="Calibration err" value={summary.calibrationError.toFixed(3)} tone="info" sub="brier score" />
          <MetricStat label="12-wk gain" value={`+${summary.improvement}%`} tone="success" sub="accuracy uplift" />
          <MetricStat label="Re-tunings" value={records.filter((r) => Math.abs(r.predictedRisk - r.actualRisk) > 8).length} tone="warning" sub="priors updated" />
        </div>

        {/* Predicted vs Actual scatter */}
        <Panel
          title="Predicted vs Actual Delay"
          subtitle="Each dot is a closed event. The diagonal is a perfect forecast."
          className="col-span-12 lg:col-span-7"
          action={<Badge tone="info"><Target className="size-3" /> y = x ideal</Badge>}
        >
          <div className="h-[320px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  type="number" dataKey="predictedDelayMin" name="Predicted"
                  unit="m" domain={[0, maxDelay]} stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11, fontFamily: "ui-monospace" }}
                  label={{ value: "Predicted delay (min)", position: "insideBottom", offset: -15, fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  type="number" dataKey="actualDelayMin" name="Actual"
                  unit="m" domain={[0, maxDelay]} stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11, fontFamily: "ui-monospace" }}
                  label={{ value: "Actual (min)", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", fontSize: 12 }}
                  formatter={(v: number, n: string) => [`${v} min`, n]}
                />
                <Scatter data={identity} line={{ stroke: "var(--border)", strokeDasharray: "4 4" }} shape={() => <></>} legendType="none" />
                <Scatter name="Events" data={scatter} fill={C_PRED} fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Calibration */}
        <Panel
          title="Model Calibration"
          subtitle="Reliability diagram — predicted risk vs observed outcome by decile."
          className="col-span-12 lg:col-span-5"
          action={<Badge tone="success">brier {summary.calibrationError.toFixed(3)}</Badge>}
        >
          <div className="h-[320px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calib} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="predicted" unit="%" stroke="var(--muted-foreground)" tick={{ fontSize: 11, fontFamily: "ui-monospace" }}
                  label={{ value: "Predicted risk", position: "insideBottom", offset: -15, fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis unit="%" domain={[0, 100]} stroke="var(--muted-foreground)" tick={{ fontSize: 11, fontFamily: "ui-monospace" }} />
                <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", fontSize: 12 }} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="var(--border)" strokeDasharray="4 4" label={{ value: "perfect", fill: "var(--muted-foreground)", fontSize: 10, position: "insideTopRight" }} />
                <Line type="monotone" dataKey="actual" stroke={C_OK} strokeWidth={2} dot={{ r: 3, fill: C_OK }} name="Observed" />
                <Line type="monotone" dataKey="predicted" stroke={C_PRED} strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Learning Trend */}
        <Panel
          title="Learning Trend Over Time"
          subtitle="Weekly forecast accuracy and mean-absolute-error. Trend shows continuous improvement."
          className="col-span-12 lg:col-span-7"
          action={<Badge tone="success"><TrendingUp className="size-3" /> +{summary.improvement}% in 12w</Badge>}
        >
          <div className="h-[300px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C_OK} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={C_OK} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" tick={{ fontSize: 11, fontFamily: "ui-monospace" }} />
                <YAxis yAxisId="acc" unit="%" domain={[0, 100]} stroke="var(--muted-foreground)" tick={{ fontSize: 11, fontFamily: "ui-monospace" }} />
                <YAxis yAxisId="mae" orientation="right" unit="m" stroke="var(--muted-foreground)" tick={{ fontSize: 11, fontFamily: "ui-monospace" }} />
                <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "ui-monospace" }} />
                <Area yAxisId="acc" type="monotone" dataKey="accuracy" stroke={C_OK} fill="url(#accGrad)" strokeWidth={2} name="Accuracy %" />
                <Line yAxisId="mae" type="monotone" dataKey="mae" stroke={C_WARN} strokeWidth={2} dot={false} name="MAE (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Workflow */}
        <Panel
          title="Learning Workflow"
          subtitle="What happens after every closed event."
          className="col-span-12 lg:col-span-5"
        >
          <ol className="p-4 space-y-3 text-sm">
            {[
              { icon: Activity, t: "Capture outcome", d: "Actual delay, risk peak and officer count are written back." },
              { icon: Target, t: "Compute error", d: "Δ delay & risk vs forecast. Drift = |Δrisk| > 8." },
              { icon: Brain, t: "Re-weight priors", d: "Corridor and cause priors updated by gradient step." },
              { icon: Workflow, t: "Recalibrate", d: "Brier score recomputed; reliability bins re-fit." },
              { icon: GitBranch, t: "Promote model", d: "New version shipped to twin & strategist on green eval." },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={i} className="flex gap-3">
                  <div className="size-7 rounded-md bg-primary/15 border border-primary/30 grid place-items-center shrink-0">
                    <Icon className="size-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{s.t}</div>
                    <div className="text-[12px] text-muted-foreground">{s.d}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        {/* Historical performance ledger */}
        <Panel title="Historical Performance" subtitle="Latest closed events — predicted vs actual delay." className="col-span-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">When</th>
                  <th className="px-4 py-2">Event</th>
                  <th className="px-4 py-2 text-right">Predicted</th>
                  <th className="px-4 py-2 text-right">Actual</th>
                  <th className="px-4 py-2 text-right">Δ</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 hover:bg-accent/20">
                    <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">{r.id}</td>
                    <td className="px-4 py-2 font-mono text-[11px]">{r.date}</td>
                    <td className="px-4 py-2 capitalize">{r.event}</td>
                    <td className="px-4 py-2 text-right font-mono">{r.predicted}m</td>
                    <td className="px-4 py-2 text-right font-mono">{r.actual}m</td>
                    <td className="px-4 py-2 text-right font-mono">
                      <span className="inline-flex items-center gap-0.5" style={{ color: r.delta >= 0 ? "var(--critical)" : "var(--success)" }}>
                        {r.delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {r.delta > 0 ? "+" : ""}{r.delta}m
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Badge tone={r.status === "on-target" ? "success" : r.status === "improved" ? "info" : "warning"}>
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Per-event drill-down (kept from prior view) */}
        <Panel title="Per-Event Learning Notes" className="col-span-12">
          <div className="divide-y divide-border">
            {records.map((r) => {
              const delta = r.actualRisk - r.predictedRisk;
              const accurate = Math.abs(delta) <= 8;
              return (
                <div key={r.id} className="p-4 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 lg:col-span-5">
                    <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
                    <div className="text-sm font-medium mt-0.5 capitalize">{r.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Brain className="size-3 text-primary" /> {r.notes}
                    </div>
                  </div>
                  <KpiBar label="Risk" pred={r.predictedRisk} act={r.actualRisk} unit="" />
                  <KpiBar label="Delay" pred={r.predictedDelayMin} act={r.actualDelayMin} unit="m" />
                  <div className="col-span-12 lg:col-span-2 flex lg:justify-end items-center gap-2">
                    <Badge tone={accurate ? "success" : "warning"}>{accurate ? "on target" : "re-tuned"}</Badge>
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
        <Row color={C_PRED} pct={(pred / max) * 100} label={`${pred}${unit}`} tag="pred" />
        <Row color={C_ACT} pct={(act / max) * 100} label={`${act}${unit}`} tag="act" />
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
