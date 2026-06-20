// NETHRA — OSRM-backed diversion routing.
// Calls the public OSRM demo server from a server function so the browser
// never hits OSRM directly (CORS-safe, retryable, swappable for self-hosted).
// Strategy:
//   1. Pick a synthetic origin and destination 3 km on opposite sides of the
//      incident along the dominant road bearing. These approximate the
//      upstream/downstream traffic flow into the affected corridor.
//   2. Ask OSRM for the "baseline" route start -> incident -> end (the path
//      traffic would take through the affected area).
//   3. Ask OSRM for up to 3 alternate routes start -> end that the engine
//      can pick around the incident.
//   4. For each alternate compute: extra minutes vs baseline, min distance
//      to incident (avoidance quality), capacity heuristic from road class.
import { createServerFn } from "@tanstack/react-start";

const OSRM = "https://router.project-osrm.org";

export type TurnStep = {
  instruction: string;
  distanceM: number;
  durationS: number;
  name: string;
  modifier?: string;
  type?: string;
};

export type OsrmRoute = {
  id: string;
  name: string;
  recommended: boolean;
  geometry: [number, number][];      // [lat, lng] for the SVG map
  distanceKm: number;
  durationMin: number;
  extraMinutes: number;              // vs baseline (through-incident) route
  congestionReductionPct: number;    // 0–100, heuristic
  capacityPct: number;               // 0–100, road-class heuristic
  minDistanceFromIncidentKm: number; // closest approach to the incident
  steps: TurnStep[];
};

export type OsrmBundle = {
  ok: boolean;
  source: "osrm" | "fallback";
  baseline?: { distanceKm: number; durationMin: number };
  routes: OsrmRoute[];
  error?: string;
};

const R = 6371;
function offset(lat: number, lng: number, bearingDeg: number, km: number): [number, number] {
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(br));
  const lng2 = lng1 + Math.atan2(
    Math.sin(br) * Math.sin(km / R) * Math.cos(lat1),
    Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2),
  );
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}
function haversine([la1, ln1]: [number, number], [la2, ln2]: [number, number]) {
  const dLat = ((la2 - la1) * Math.PI) / 180;
  const dLng = ((ln2 - ln1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildOsrmUrl(coords: [number, number][], opts: { alternatives?: number | boolean; steps?: boolean }) {
  // OSRM expects lng,lat;lng,lat
  const path = coords.map(([la, ln]) => `${ln.toFixed(6)},${la.toFixed(6)}`).join(";");
  const q = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: opts.steps ? "true" : "false",
  });
  if (opts.alternatives) q.set("alternatives", String(opts.alternatives));
  return `${OSRM}/route/v1/driving/${path}?${q.toString()}`;
}

type OsrmStep = {
  distance: number; duration: number; name?: string;
  maneuver?: { type?: string; modifier?: string };
};
type OsrmLeg = { steps?: OsrmStep[] };
type OsrmRouteRaw = {
  distance: number;
  duration: number;
  geometry: { coordinates: [number, number][] };
  legs?: OsrmLeg[];
};
type OsrmResp = { code: string; routes?: OsrmRouteRaw[]; message?: string };

function humanizeStep(s: OsrmStep): TurnStep {
  const t = s.maneuver?.type ?? "continue";
  const m = s.maneuver?.modifier;
  const road = s.name?.trim() || "road";
  const parts: string[] = [];
  switch (t) {
    case "depart": parts.push(`Depart on ${road}`); break;
    case "arrive": parts.push(`Arrive at destination`); break;
    case "turn": parts.push(`Turn ${m ?? ""} onto ${road}`); break;
    case "merge": parts.push(`Merge ${m ?? ""} onto ${road}`); break;
    case "on ramp": parts.push(`Take the ramp ${m ?? ""} onto ${road}`); break;
    case "off ramp": parts.push(`Take exit ${m ?? ""} toward ${road}`); break;
    case "fork": parts.push(`Keep ${m ?? "ahead"} at fork onto ${road}`); break;
    case "roundabout":
    case "rotary": parts.push(`Enter roundabout, exit onto ${road}`); break;
    case "end of road": parts.push(`At end of road, turn ${m ?? ""} onto ${road}`); break;
    case "continue":
    default: parts.push(`Continue ${m ?? "straight"} on ${road}`); break;
  }
  return {
    instruction: parts.join(" ").replace(/\s+/g, " ").trim(),
    distanceM: Math.round(s.distance),
    durationS: Math.round(s.duration),
    name: road,
    modifier: m,
    type: t,
  };
}

async function fetchOsrm(url: string): Promise<OsrmResp> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "NETHRA/1.0 (traffic-ops)" },
    });
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    return (await res.json()) as OsrmResp;
  } finally {
    clearTimeout(t);
  }
}

export const getDiversionRoutes = createServerFn({ method: "POST" })
  .inputValidator((d: { lat: number; lng: number; impactRadiusKm?: number; bearingDeg?: number }) => d)
  .handler(async ({ data }): Promise<OsrmBundle> => {
    const { lat, lng, impactRadiusKm = 1.5, bearingDeg = 35 } = data;
    // Origin/destination 3 km on opposite sides of the incident along the
    // dominant corridor bearing (default NE/SW — common Bengaluru arterial axis).
    const spread = Math.max(3, impactRadiusKm * 2.5);
    const origin = offset(lat, lng, (bearingDeg + 180) % 360, spread);
    const dest = offset(lat, lng, bearingDeg, spread);

    try {
      const [baseRes, altRes] = await Promise.all([
        fetchOsrm(buildOsrmUrl([origin, [lat, lng], dest], { steps: false })),
        fetchOsrm(buildOsrmUrl([origin, dest], { alternatives: 3, steps: true })),
      ]);
      if (baseRes.code !== "Ok" || !baseRes.routes?.length) throw new Error(`OSRM baseline: ${baseRes.message ?? baseRes.code}`);
      if (altRes.code !== "Ok" || !altRes.routes?.length) throw new Error(`OSRM alternates: ${altRes.message ?? altRes.code}`);

      const baselineDurMin = baseRes.routes[0].duration / 60;
      const baselineKm = baseRes.routes[0].distance / 1000;

      const palette = ["North bypass", "South arterial", "East ring loop", "Inner ring shortcut"];
      const routes: OsrmRoute[] = altRes.routes.slice(0, 3).map((r, idx) => {
        const geometry: [number, number][] = r.geometry.coordinates.map(([ln, la]) => [la, ln]);
        // closest approach to incident
        let minD = Infinity;
        for (const pt of geometry) {
          const d = haversine(pt, [lat, lng]);
          if (d < minD) minD = d;
        }
        const durationMin = r.duration / 60;
        const distanceKm = r.distance / 1000;
        const extraMinutes = Math.max(0, Math.round(durationMin - baselineDurMin));
        // congestion reduction heuristic: how far the route stays from the
        // impact radius. Beyond 2x radius is ~95% effective; on top of it 0%.
        const clearance = Math.max(0, minD - impactRadiusKm * 0.4);
        const congestionReductionPct = Math.round(
          Math.max(0, Math.min(95, (clearance / (impactRadiusKm * 1.6)) * 95)),
        );
        // capacity heuristic: avg edge length proxies arterial vs side-street.
        const stepsRaw = r.legs?.flatMap((l) => l.steps ?? []) ?? [];
        const avgEdgeM = stepsRaw.length ? r.distance / stepsRaw.length : 250;
        const capacityPct = Math.max(35, Math.min(95, Math.round(40 + avgEdgeM / 12)));
        const steps = stepsRaw.map(humanizeStep).filter((s) => s.distanceM > 5 || s.type === "arrive");

        return {
          id: `OSRM-${idx + 1}`,
          name: palette[idx] ?? `Alternate ${idx + 1}`,
          recommended: false,
          geometry,
          distanceKm: +distanceKm.toFixed(2),
          durationMin: +durationMin.toFixed(1),
          extraMinutes,
          congestionReductionPct,
          capacityPct,
          minDistanceFromIncidentKm: +minD.toFixed(2),
          steps,
        };
      });

      // Recommend: highest (congestionReduction * 0.6 + capacity * 0.4) penalized by extra minutes.
      const scored = routes.map((r) => ({
        r,
        s: r.congestionReductionPct * 0.6 + r.capacityPct * 0.4 - r.extraMinutes * 1.2,
      }));
      scored.sort((a, b) => b.s - a.s);
      if (scored[0]) scored[0].r.recommended = true;

      return {
        ok: true,
        source: "osrm",
        baseline: { distanceKm: +baselineKm.toFixed(2), durationMin: +baselineDurMin.toFixed(1) },
        routes,
      };
    } catch (e) {
      // Graceful fallback so the UI never blanks if OSRM is unreachable.
      const variants = [
        { name: "North bypass", bearing: bearingDeg + 90 },
        { name: "South arterial", bearing: bearingDeg - 90 },
        { name: "East ring loop", bearing: bearingDeg + 45 },
      ];
      const routes: OsrmRoute[] = variants.map((v, idx) => {
        const r = Math.max(1.8, impactRadiusKm + 0.6);
        const mid1 = offset(lat, lng, v.bearing - 25, r);
        const mid2 = offset(lat, lng, v.bearing, r * 1.4);
        const mid3 = offset(lat, lng, v.bearing + 25, r);
        const geometry: [number, number][] = [origin, mid1, mid2, mid3, dest];
        const dist = geometry.slice(1).reduce((acc, p, i) => acc + haversine(geometry[i], p), 0);
        const dur = dist * 2.4; // ~25 km/h urban
        return {
          id: `FALLBACK-${idx + 1}`,
          name: v.name,
          recommended: idx === 0,
          geometry,
          distanceKm: +dist.toFixed(2),
          durationMin: +dur.toFixed(1),
          extraMinutes: 4 + idx * 3,
          congestionReductionPct: 80 - idx * 15,
          capacityPct: 78 - idx * 10,
          minDistanceFromIncidentKm: +(r * 0.9).toFixed(2),
          steps: [
            { instruction: `Depart staging point on ${v.name}`, distanceM: 800, durationS: 120, name: v.name },
            { instruction: `Continue around the impact zone`, distanceM: Math.round(dist * 600), durationS: Math.round(dur * 36), name: v.name },
            { instruction: `Arrive at destination`, distanceM: 0, durationS: 0, name: "destination", type: "arrive" },
          ],
        };
      });
      return {
        ok: false,
        source: "fallback",
        routes,
        error: e instanceof Error ? e.message : "OSRM unreachable",
      };
    }
  });
