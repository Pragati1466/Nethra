import { Panel, Badge } from "@/components/nethra/AppShell";
import { type ImpactAssessment, formatPeople, formatInr } from "@/lib/impact";
import { Users, Clock, Cross, GraduationCap, Siren, IndianRupee, AlertTriangle, Baby } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImpactPanel({ impact, className }: { impact: ImpactAssessment; className?: string }) {
  const ea = impact.emergencyAccessRisk;
  const eaTone = ea.band === "severe" ? "critical" : ea.band === "high" ? "warning" : ea.band === "moderate" ? "info" : "success";
  return (
    <Panel
      title="Citizen Impact"
      subtitle="Human consequences beyond traffic metrics"
      action={<Badge tone="info">{impact.confidence}% confidence</Badge>}
      className={cn(className)}
    >
      <div className="p-4 space-y-4">
        {/* Headline stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <ImpactStat icon={Users} label="People affected" value={formatPeople(impact.peopleAffected)} tone="warning" />
          <ImpactStat icon={Clock} label="People-hours lost" value={formatPeople(impact.peopleHoursLost)} tone="warning" />
          <ImpactStat icon={IndianRupee} label="Economic loss" value={formatInr(impact.economic.inrLakhs * 100000)} tone="critical" />
          <ImpactStat icon={Cross} label="Hospitals impacted" value={impact.hospitals.length} sub={`${ea.blockedERs} ER inside ring`} tone={ea.blockedERs > 0 ? "critical" : "info"} />
          <ImpactStat icon={GraduationCap} label="Schools impacted" value={impact.schools.length} sub={`~${impact.demographics.children.toLocaleString()} students`} tone="info" />
          <ImpactStat icon={Siren} label="Emergency access" value={`${ea.score}/100`} sub={`+${ea.extraResponseMin} min response`} tone={eaTone} />
        </div>

        {/* Narrative */}
        <div className="rounded-md border border-border bg-card/40 p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Why this matters</div>
          <ul className="space-y-1.5 text-[13px] text-foreground/85">
            {impact.narrative.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary mt-1">›</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Hospitals */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cross className="size-3.5 text-critical" />
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Hospitals in reach</div>
            </div>
            <div className="rounded-md border border-border divide-y divide-border max-h-44 overflow-auto">
              {impact.hospitals.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground">No hospitals within impact reach.</div>
              )}
              {impact.hospitals.map((h) => (
                <FacilityRow
                  key={h.id}
                  name={h.name}
                  meta={`${h.distanceKm} km · ${h.beds} beds${h.emergency ? " · ER" : ""}`}
                  severity={h.severity}
                  extra={`+${h.detourMinutes}m`}
                />
              ))}
            </div>
          </div>

          {/* Schools */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="size-3.5 text-info" />
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Schools in reach</div>
            </div>
            <div className="rounded-md border border-border divide-y divide-border max-h-44 overflow-auto">
              {impact.schools.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground">No schools within impact reach.</div>
              )}
              {impact.schools.map((s) => (
                <FacilityRow
                  key={s.id}
                  name={s.name}
                  meta={`${s.distanceKm} km · ${s.students?.toLocaleString()} students`}
                  severity={s.severity}
                  extra={`+${s.detourMinutes}m`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Emergency callout */}
        {ea.band === "high" || ea.band === "severe" ? (
          <div className="rounded-md border border-critical/40 bg-critical/10 p-3 flex gap-3">
            <AlertTriangle className="size-4 text-critical mt-0.5 shrink-0" />
            <div className="text-[13px]">
              <div className="font-medium text-critical">Emergency access at {ea.band} risk</div>
              <div className="text-foreground/80 mt-0.5">
                Nearest ER is {ea.nearestEmergencyKm} km away. Reserve at least one corridor as a green channel and pre-position an ambulance inside the ring.
              </div>
            </div>
          </div>
        ) : null}

        {/* Economic breakdown */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Economic impact breakdown</div>
          <div className="space-y-1.5">
            {impact.economic.breakdown.map((b) => {
              const max = Math.max(...impact.economic.breakdown.map((x) => Math.abs(x.inr))) || 1;
              const pct = Math.max(2, Math.round((Math.abs(b.inr) / max) * 100));
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-foreground/80">{b.label}</span>
                    <span className="font-mono text-foreground/90">{formatInr(b.inr)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <DemoStat label="Residents" value={formatPeople(impact.demographics.residents)} />
          <DemoStat label="Workers" value={formatPeople(impact.demographics.workers)} />
          <DemoStat label="Children" value={formatPeople(impact.demographics.children)} icon={Baby} />
          <DemoStat label="Elderly" value={formatPeople(impact.demographics.elderly)} />
        </div>
      </div>
    </Panel>
  );
}

function ImpactStat({
  icon: Icon, label, value, sub, tone = "info",
}: { icon: typeof Users; label: string; value: string | number; sub?: string; tone?: "info" | "warning" | "critical" | "success" }) {
  const toneCls: Record<string, string> = {
    info: "text-info",
    warning: "text-warning",
    critical: "text-critical",
    success: "text-success",
  };
  return (
    <div className="rounded-md border border-border bg-card/50 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("size-3", toneCls[tone])} />
        {label}
      </div>
      <div className={cn("text-lg font-semibold mt-1 tabular-nums", toneCls[tone])}>{value}</div>
      {sub && <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function FacilityRow({ name, meta, severity, extra }: { name: string; meta: string; severity: "high" | "moderate" | "low"; extra: string }) {
  const tone = severity === "high" ? "critical" : severity === "moderate" ? "warning" : "info";
  return (
    <div className="p-2.5 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] truncate">{name}</div>
        <div className="text-[11px] font-mono text-muted-foreground truncate">{meta}</div>
      </div>
      <Badge tone={tone}>{severity}</Badge>
      <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">{extra}</span>
    </div>
  );
}

function DemoStat({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Users }) {
  return (
    <div className="rounded-md border border-border bg-card/40 p-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
        {Icon && <Icon className="size-3" />} {label}
      </div>
      <div className="text-sm font-semibold mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}
