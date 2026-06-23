import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { INCIDENTS, type PlannedEvent, riskBand } from "@/lib/intel";
import { Maximize2, Minimize2 } from "lucide-react";

// Bengaluru bounding box (slightly padded). All projections are linear within it.
const BBOX = { minLat: 12.82, maxLat: 13.18, minLng: 77.45, maxLng: 77.78 };

type RouteLine = { points: [number, number][]; color?: string; dashed?: boolean; label?: string };
export type MapUnit = { id: string; lat: number; lng: number; callsign: string; status: string; tone?: "info" | "warning" | "success" | "muted" };
type Props = {
  height?: number | string;
  events?: PlannedEvent[];
  focus?: { lat: number; lng: number; impactRadiusKm?: number; riskScore?: number } | null;
  onPick?: (lat: number, lng: number) => void;
  showHeat?: boolean;
  routes?: RouteLine[];
  units?: MapUnit[];
  className?: string;
};

const VIEW_W = 1000;
const VIEW_H = 700;

function project(lat: number, lng: number) {
  const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * VIEW_W;
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * VIEW_H;
  return { x, y };
}
function unproject(x: number, y: number) {
  const lng = BBOX.minLng + (x / VIEW_W) * (BBOX.maxLng - BBOX.minLng);
  const lat = BBOX.maxLat - (y / VIEW_H) * (BBOX.maxLat - BBOX.minLat);
  return { lat, lng };
}
// Approx 1 km in viewport units (mid-latitude Bengaluru ~12.97°).
const KM_PER_DEG_LAT = 110.9;
const KM_PER_DEG_LNG = 108.3;
function kmToViewportRadius(km: number) {
  const dLat = km / KM_PER_DEG_LAT;
  const dLng = km / KM_PER_DEG_LNG;
  const rx = (dLng / (BBOX.maxLng - BBOX.minLng)) * VIEW_W;
  const ry = (dLat / (BBOX.maxLat - BBOX.minLat)) * VIEW_H;
  return (rx + ry) / 2;
}

// Decorative arterial roads — stylized lines representing major corridors.
const ARTERIALS: { name: string; coords: [number, number][] }[] = [
  { name: "ORR", coords: [[13.05, 77.50], [13.10, 77.60], [13.06, 77.72], [12.95, 77.76], [12.85, 77.70], [12.85, 77.55], [12.95, 77.50], [13.05, 77.50]] },
  { name: "Tumkur Road", coords: [[13.18, 77.45], [13.04, 77.52], [12.97, 77.58]] },
  { name: "Bellary Road", coords: [[13.18, 77.59], [13.05, 77.59], [12.97, 77.59]] },
  { name: "Old Madras Road", coords: [[12.99, 77.78], [12.98, 77.70], [12.97, 77.60]] },
  { name: "Hosur Road", coords: [[12.82, 77.70], [12.90, 77.65], [12.97, 77.60]] },
  { name: "Mysore Road", coords: [[12.85, 77.45], [12.92, 77.52], [12.97, 77.58]] },
  { name: "Magadi Road", coords: [[12.99, 77.46], [12.98, 77.53], [12.97, 77.58]] },
  { name: "Bannerghatta", coords: [[12.82, 77.58], [12.88, 77.59], [12.97, 77.59]] },
];

export function CityMap({ height = "100%", events = [], focus, onPick, showHeat = true, routes, units, className }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPin, setHoverPin] = useState<PlannedEvent | null>(null);
  const [tick, setTick] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const h = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(h);
  }, []);

  // Keep fullscreen state in sync with browser events (e.g. user presses Escape)
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const heatClusters = useMemo(() => {
    // Bin incidents into ~30px buckets, return centers with weight.
    const cell = 32;
    const map = new Map<string, { x: number; y: number; w: number }>();
    for (const i of INCIDENTS) {
      const { x, y } = project(i.lat, i.lng);
      if (x < 0 || x > VIEW_W || y < 0 || y > VIEW_H) continue;
      const k = `${Math.floor(x / cell)}_${Math.floor(y / cell)}`;
      const w = i.priority === "High" ? 2 : 1;
      const prev = map.get(k);
      if (prev) { prev.w += w; prev.x = (prev.x + x) / 2; prev.y = (prev.y + y) / 2; }
      else map.set(k, { x, y, w });
    }
    return [...map.values()];
  }, []);
  const maxW = heatClusters.reduce((m, c) => Math.max(m, c.w), 1);

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!onPick || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const { lat, lng } = unproject(inv.x, inv.y);
    onPick(lat, lng);
  }

  return (
    <div ref={containerRef} className={className} style={{
      height: isFullscreen ? "100vh" : height, width: "100%", position: "relative", borderRadius: isFullscreen ? 0 : 8, overflow: "hidden",
      background: "radial-gradient(ellipse at center, oklch(0.20 0.03 230), oklch(0.14 0.02 250) 70%)",
      border: "1px solid var(--border)"
    }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        onClick={handleClick}
        style={{ cursor: onPick ? "crosshair" : "default", display: "block" }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.30 0.025 250 / 0.35)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="heat" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#fb923c" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#facc15" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="oklch(0.10 0.02 250)" stopOpacity="0.85" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>

        {/* Grid */}
        <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

        {/* Crosshair */}
        <line x1={VIEW_W / 2} y1="0" x2={VIEW_W / 2} y2={VIEW_H} stroke="oklch(0.78 0.16 200 / 0.18)" strokeWidth="0.5" strokeDasharray="2 6" />
        <line x1="0" y1={VIEW_H / 2} x2={VIEW_W} y2={VIEW_H / 2} stroke="oklch(0.78 0.16 200 / 0.18)" strokeWidth="0.5" strokeDasharray="2 6" />

        {/* Arterials */}
        {ARTERIALS.map((road) => (
          <g key={road.name}>
            <polyline
              points={road.coords.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(" ")}
              fill="none" stroke="oklch(0.55 0.06 220 / 0.55)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"
            />
          </g>
        ))}

        {/* Heat clusters */}
        {showHeat && heatClusters.map((c, i) => {
          const intensity = c.w / maxW;
          const r = 18 + intensity * 28;
          return <circle key={i} cx={c.x} cy={c.y} r={r} fill="url(#heat)" opacity={0.4 + intensity * 0.5} />;
        })}

        {/* Diversion / alternate route lines */}
        {routes?.map((rt, i) => {
          const pts = rt.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(" ");
          const color = rt.color ?? "var(--primary)";
          return (
            <g key={`rt-${i}`}>
              <polyline points={pts} fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
              <polyline points={pts} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"
                strokeDasharray={rt.dashed ? "6 6" : undefined} />
            </g>
          );
        })}

        {/* Focus impact radius */}
        {focus && (() => {
          const p = project(focus.lat, focus.lng);
          const r = kmToViewportRadius(focus.impactRadiusKm ?? 1);
          const band = riskBand(focus.riskScore ?? 60);
          return (
            <g>
              <circle cx={p.x} cy={p.y} r={r} fill={band.color} fillOpacity="0.10" stroke={band.color} strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx={p.x} cy={p.y} r={r * (0.5 + ((tick % 5) / 10))} fill="none" stroke={band.color} strokeWidth="0.8" opacity={0.5 - ((tick % 5) / 12)} />
              <circle cx={p.x} cy={p.y} r="6" fill={band.color} stroke="#0a0a14" strokeWidth="2" />
            </g>
          );
        })()}

        {/* Event pins */}
        {events.map((e) => {
          const p = project(e.lat, e.lng);
          const band = riskBand(e.status === "live" ? 85 : 60);
          return (
            <g key={e.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoverPin(e)} onMouseLeave={() => setHoverPin(null)}>
              <circle r="14" fill={band.color} opacity="0.18" filter="url(#glow)" />
              <circle r="10" fill={band.color} stroke="#0a0a14" strokeWidth="2" />
              <text textAnchor="middle" y="4" fontSize="11" fontWeight="700" fill="#0a0a14" fontFamily="ui-sans-serif">
                {e.kind[0].toUpperCase()}
              </text>
              {e.status === "live" && (
                <circle r={10 + (tick % 3) * 4} fill="none" stroke={band.color} strokeWidth="1" opacity={0.6 - (tick % 3) * 0.2} />
              )}
            </g>
          );
        })}

        {/* Live field units */}
        {units?.map((u) => {
          const p = project(u.lat, u.lng);
          const color = u.tone === "success" ? "var(--success)"
            : u.tone === "warning" ? "var(--warning)"
              : u.tone === "muted" ? "var(--muted-foreground)" : "var(--info)";
          return (
            <g key={u.id} transform={`translate(${p.x},${p.y})`} style={{ transition: "transform 1s linear" }}>
              <circle r={4 + (tick % 4)} fill={color} opacity={0.18} />
              <circle r="3.5" fill={color} stroke="#0a0a14" strokeWidth="1" />
              <text x="6" y="-4" fontSize="8" fill={color} fontFamily="ui-mono, monospace">{u.callsign}</text>
            </g>
          );
        })}

        {/* Vignette overlay */}
        <rect width={VIEW_W} height={VIEW_H} fill="url(#vignette)" pointerEvents="none" />

        {/* Tooltip */}
        {hoverPin && (() => {
          const p = project(hoverPin.lat, hoverPin.lng);
          const tx = Math.min(VIEW_W - 220, p.x + 14);
          const ty = Math.max(10, p.y - 60);
          return (
            <g transform={`translate(${tx},${ty})`} pointerEvents="none">
              <rect width="220" height="58" rx="6" fill="oklch(0.16 0.02 250 / 0.95)" stroke="var(--border)" />
              <text x="10" y="20" fontSize="12" fontWeight="600" fill="#fff" fontFamily="ui-sans-serif">{hoverPin.name}</text>
              <text x="10" y="36" fontSize="10" fill="#9ca3af" fontFamily="ui-sans-serif">{hoverPin.address.slice(0, 36)}</text>
              <text x="10" y="50" fontSize="10" fill="#22d3ee" fontFamily="ui-mono, monospace">
                {hoverPin.crowd.toLocaleString()} · {hoverPin.status}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* HUD chips */}
      <div style={{ position: "absolute", left: 10, top: 10, display: "flex", gap: 6, pointerEvents: "none" }}>
        <span className="font-mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "oklch(0.20 0.022 250 / 0.85)", color: "var(--primary)", border: "1px solid var(--border)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          NETHRA · TACTICAL VIEW
        </span>
        <span className="font-mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "oklch(0.20 0.022 250 / 0.85)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
          12.97°N · 77.59°E
        </span>
      </div>

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "oklch(0.20 0.022 250 / 0.85)",
          border: "1px solid var(--border)",
          color: "var(--muted-foreground)",
          cursor: "pointer",
          transition: "color 0.15s, background 0.15s",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
          (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.25 0.03 250 / 0.95)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
          (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.20 0.022 250 / 0.85)";
        }}
      >
        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>

      <div style={{ position: "absolute", right: 10, bottom: 10, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>
        BENGALURU · {INCIDENTS.length} INTEL POINTS
      </div>
    </div>
  );
}
