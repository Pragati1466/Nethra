import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Radio, CalendarPlus, Map, Bot, History, PlayCircle, Shield, Route as RouteIcon, Users, Brain } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Radio; end?: boolean };
const nav: NavItem[] = [
  { to: "/", label: "Command Center", icon: Radio, end: true },
  { to: "/twin", label: "Digital Twin", icon: Map },
  { to: "/events/new", label: "Create Event", icon: CalendarPlus },
  { to: "/diversion", label: "Diversion Planner", icon: RouteIcon },
  { to: "/resources", label: "Resource Optimization", icon: Users },
  { to: "/strategist", label: "AI Strategist", icon: Bot },
  { to: "/replay", label: "Decision Replay", icon: History },
  { to: "/learn", label: "Learn Loop", icon: Brain },
  { to: "/demo", label: "One-Click Demo", icon: PlayCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-panel/80 backdrop-blur">
        <div className="px-4 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="size-8 rounded-md bg-primary/15 border border-primary/40 grid place-items-center">
                <Shield className="size-4 text-primary" />
              </div>
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-success pulse-dot relative" />
            </div>
            <div>
              <div className="font-semibold tracking-wide text-sm leading-none">NETHRA</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">TRAFFIC OS · v1.0</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = n.end ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-border text-[11px] font-mono text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-success" /> Bengaluru node · online
          </div>
          <div>Latency 38ms · 8,173 events</div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function TopBar() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const h = setInterval(tick, 1000);
    return () => clearInterval(h);
  }, []);
  return (
    <header className="h-12 border-b border-border bg-panel/60 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <Activity className="size-3.5 text-success" />
        <span>OPS · BENGALURU</span>
        <span className="text-border">|</span>
        <span suppressHydrationWarning>{now} IST</span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-xs">
        <Badge tone="success">3 events active</Badge>
        <Badge tone="warning">2 alerts</Badge>
        <Badge tone="info">12 units deployed</Badge>
      </div>
    </header>
  );
}

export function Badge({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "success" | "warning" | "critical" | "muted";
  children: ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    info: "bg-info/15 text-info border-info/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    critical: "bg-critical/15 text-critical border-critical/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border font-mono uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  title, subtitle, action, children, className,
}: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-panel/70 backdrop-blur", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div>
            {title && <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
