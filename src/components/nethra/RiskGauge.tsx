import { riskBand } from "@/lib/intel";

export function RiskGauge({ score, label = "Risk Score", size = 140 }: { score: number; label?: string; size?: number }) {
  const band = riskBand(score);
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth="8" fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={band.color} strokeWidth="8" fill="none"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 600ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-mono text-3xl font-semibold" style={{ color: band.color }}>{score}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">/ 100</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold mt-0.5" style={{ color: band.color }}>{band.label}</div>
      </div>
    </div>
  );
}

export function MetricStat({ label, value, sub, tone = "default" }: { label: string; value: string | number; sub?: string; tone?: "default" | "info" | "warning" | "critical" | "success" }) {
  const toneCls: Record<string, string> = {
    default: "text-foreground", info: "text-info", warning: "text-warning",
    critical: "text-critical", success: "text-success",
  };
  return (
    <div className="rounded-md border border-border bg-card/50 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-2xl font-semibold mt-1 ${toneCls[tone]}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
