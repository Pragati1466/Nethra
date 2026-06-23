/**
 * NETHRA Hotspot Model — Kernel Density Estimation (KDE)
 *
 * Trains on incidents.json to produce:
 *   1. Per-location hotspot probability (0–1) via Gaussian KDE
 *   2. Corridor stress scores — learned from incident frequency + closure rate
 *   3. Time-of-day heatmap buckets — when does each zone get hot?
 *
 * Used by predictImpact() to sharpen impactRadiusKm and affectedCorridors
 * beyond simple nearest-incident counting.
 */

import type { Incident } from "@/lib/intel";
import raw from "@/data/incidents.json";

const INCIDENTS = raw as Incident[];

// ── Types ──────────────────────────────────────────────────────────────────

export type HotspotResult = {
  /** KDE density value at the queried point, 0–1 normalised */
  densityScore: number;
  /** Estimated impact radius in km, derived from local density */
  estimatedRadiusKm: number;
  /** Top corridors ranked by stress weight */
  stressedCorridors: CorridorStress[];
  /** Top junctions ranked by incident concentration */
  stressedJunctions: JunctionStress[];
  /** Hour buckets showing when this zone is hottest */
  peakHours: number[];
  reasoning: string[];
};

export type CorridorStress = {
  corridor: string;
  incidentCount: number;
  closureRate: number;
  stressWeight: number;    // 0–1 composite stress score
};

export type JunctionStress = {
  junction: string;
  incidentCount: number;
  closureRate: number;
  stressWeight: number;
};

// ── Internal state ─────────────────────────────────────────────────────────

type TrainedState = {
  // All incident points for KDE queries
  points: Array<{ lat: number; lng: number; weight: number }>;
  // Per-corridor aggregates
  corridorStats: Map<string, { count: number; closures: number }>;
  // Per-junction aggregates
  junctionStats: Map<string, { count: number; closures: number; lats: number[]; lngs: number[] }>;
  // Global max density (for normalisation)
  globalMaxDensity: number;
  // Bandwidth chosen by Silverman's rule of thumb
  bandwidth: number;
};

let _state: TrainedState | null = null;

// ── Training ───────────────────────────────────────────────────────────────

function train(): TrainedState {
  if (_state) return _state;

  const n = INCIDENTS.length;

  // Silverman's rule of thumb for bandwidth:
  // h = 1.06 * std_dev * n^(-1/5)
  const lats = INCIDENTS.map((i) => i.lat);
  const lngs = INCIDENTS.map((i) => i.lng);
  const meanLat = lats.reduce((a, b) => a + b, 0) / n;
  const meanLng = lngs.reduce((a, b) => a + b, 0) / n;
  const stdLat = Math.sqrt(lats.reduce((s, v) => s + (v - meanLat) ** 2, 0) / n);
  const stdLng = Math.sqrt(lngs.reduce((s, v) => s + (v - meanLng) ** 2, 0) / n);
  const stdDeg = (stdLat + stdLng) / 2;
  const bandwidth = Math.max(0.005, 1.06 * stdDeg * Math.pow(n, -0.2));

  // Weight each incident: closures get 2×, High priority gets 1.5×
  const points = INCIDENTS.map((i) => ({
    lat: i.lat,
    lng: i.lng,
    weight: (i.closure ? 2.0 : 1.0) * (i.priority === "High" ? 1.5 : 1.0),
  }));

  // Corridor stats
  const corridorStats = new Map<string, { count: number; closures: number }>();
  for (const inc of INCIDENTS) {
    const c = inc.corridor || "Non-corridor";
    if (!corridorStats.has(c)) corridorStats.set(c, { count: 0, closures: 0 });
    const s = corridorStats.get(c)!;
    s.count++;
    if (inc.closure) s.closures++;
  }

  // Junction stats
  const junctionStats = new Map<string, { count: number; closures: number; lats: number[]; lngs: number[] }>();
  for (const inc of INCIDENTS) {
    const j = inc.junction;
    if (!j || j === "NULL") continue;
    if (!junctionStats.has(j)) junctionStats.set(j, { count: 0, closures: 0, lats: [], lngs: [] });
    const s = junctionStats.get(j)!;
    s.count++;
    if (inc.closure) s.closures++;
    s.lats.push(inc.lat);
    s.lngs.push(inc.lng);
  }

  // Approximate max density by sampling a few known busy spots
  // (avoids a full grid scan at init time)
  const samplePts = [
    { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
    { lat: 12.9177, lng: 77.6238 }, // Silk Board
    { lat: 13.0400, lng: 77.5181 }, // Peenya
  ];
  let globalMaxDensity = 1;
  for (const pt of samplePts) {
    const d = kdeAt(pt.lat, pt.lng, points, bandwidth);
    if (d > globalMaxDensity) globalMaxDensity = d;
  }

  _state = { points, corridorStats, junctionStats, globalMaxDensity, bandwidth };
  return _state;
}

// ── KDE core ───────────────────────────────────────────────────────────────

/**
 * Gaussian KDE density at (lat, lng).
 * Uses degree-space distance (fast, sufficient for city-scale).
 */
function kdeAt(
  lat: number,
  lng: number,
  points: TrainedState["points"],
  bandwidth: number,
): number {
  // Only consider points within 3× bandwidth to keep it O(local)
  const cutoff = bandwidth * 3;
  let density = 0;
  for (const p of points) {
    const dLat = lat - p.lat;
    const dLng = lng - p.lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq > cutoff * cutoff) continue;
    // Gaussian kernel
    density += p.weight * Math.exp(-distSq / (2 * bandwidth * bandwidth));
  }
  return density;
}

const R_KM = 6371;
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.sqrt(a));
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Primary query: what does the KDE model say about this location?
 *
 * @param lat        Event latitude
 * @param lng        Event longitude
 * @param radiusKm   Search radius for corridor/junction scoring
 */
export function queryHotspot(lat: number, lng: number, radiusKm = 3.0): HotspotResult {
  const state = train();
  const { points, bandwidth, corridorStats, junctionStats, globalMaxDensity } = state;

  // 1. KDE density at event point
  const rawDensity = kdeAt(lat, lng, points, bandwidth);
  const densityScore = Math.min(1, rawDensity / globalMaxDensity);

  // 2. Estimate impact radius from density
  // High density → larger affected area (more corridors already stressed)
  const estimatedRadiusKm = +(1.0 + densityScore * 2.5).toFixed(1);

  // 3. Find nearby incidents for corridor + junction scoring
  const nearbyInc = INCIDENTS.filter(
    (i) => haversineKm(lat, lng, i.lat, i.lng) <= radiusKm,
  );

  // Corridor stress: weight corridors by their proximity incidents
  const localCorridorCounts = new Map<string, { count: number; closures: number }>();
  for (const inc of nearbyInc) {
    const c = inc.corridor || "Non-corridor";
    if (!localCorridorCounts.has(c)) localCorridorCounts.set(c, { count: 0, closures: 0 });
    const s = localCorridorCounts.get(c)!;
    s.count++;
    if (inc.closure) s.closures++;
  }

  const stressedCorridors: CorridorStress[] = [];
  for (const [corridor, local] of localCorridorCounts) {
    if (corridor === "Non-corridor" && localCorridorCounts.size > 1) continue;
    const global = corridorStats.get(corridor) ?? { count: 1, closures: 0 };
    const localClosureRate = local.closures / local.count;
    const globalClosureRate = global.closures / global.count;
    // Stress weight = local frequency × closure rate blend
    const stressWeight = Math.min(
      1,
      (local.count / Math.max(1, nearbyInc.length)) * 0.6 +
      (localClosureRate * 0.3 + globalClosureRate * 0.1),
    );
    stressedCorridors.push({
      corridor,
      incidentCount: local.count,
      closureRate: +localClosureRate.toFixed(3),
      stressWeight: +stressWeight.toFixed(3),
    });
  }
  stressedCorridors.sort((a, b) => b.stressWeight - a.stressWeight);

  // Junction stress: only junctions within radius
  const stressedJunctions: JunctionStress[] = [];
  for (const [junction, stats] of junctionStats) {
    const avgLat = stats.lats.reduce((a, b) => a + b, 0) / stats.lats.length;
    const avgLng = stats.lngs.reduce((a, b) => a + b, 0) / stats.lngs.length;
    if (haversineKm(lat, lng, avgLat, avgLng) > radiusKm) continue;
    const closureRate = stats.closures / stats.count;
    const stressWeight = Math.min(1, (stats.count / 10) * 0.7 + closureRate * 0.3);
    stressedJunctions.push({
      junction,
      incidentCount: stats.count,
      closureRate: +closureRate.toFixed(3),
      stressWeight: +stressWeight.toFixed(3),
    });
  }
  stressedJunctions.sort((a, b) => b.stressWeight - a.stressWeight);

  // 4. Peak hours for this zone
  const hourBuckets = new Array(24).fill(0);
  for (const inc of nearbyInc) {
    const h = new Date(inc.start).getUTCHours();
    hourBuckets[h] += inc.closure ? 2 : 1;
  }
  const maxBucket = Math.max(...hourBuckets, 1);
  const peakHours = hourBuckets
    .map((v, h) => ({ h, v }))
    .filter(({ v }) => v >= maxBucket * 0.6)
    .map(({ h }) => h)
    .sort((a, b) => a - b);

  // 5. Reasoning
  const reasoning: string[] = [];
  reasoning.push(
    `KDE density score ${(densityScore * 100).toFixed(0)}% — ${nearbyInc.length} historical incidents within ${radiusKm}km feed the kernel.`,
  );
  if (stressedCorridors.length > 0) {
    const top = stressedCorridors[0];
    reasoning.push(
      `Highest corridor stress: "${top.corridor}" (${top.incidentCount} nearby incidents, ${(top.closureRate * 100).toFixed(0)}% closure rate).`,
    );
  }
  if (stressedJunctions.length > 0) {
    reasoning.push(
      `Critical junction: "${stressedJunctions[0].junction}" — closure risk ${(stressedJunctions[0].closureRate * 100).toFixed(0)}%.`,
    );
  }
  if (peakHours.length > 0) {
    reasoning.push(`Zone peaks at hours: ${peakHours.join(", ")} (IST).`);
  }
  reasoning.push(
    `Estimated impact radius from KDE: ${estimatedRadiusKm} km.`,
  );

  return {
    densityScore: +densityScore.toFixed(3),
    estimatedRadiusKm,
    stressedCorridors: stressedCorridors.slice(0, 5),
    stressedJunctions: stressedJunctions.slice(0, 5),
    peakHours,
    reasoning,
  };
}

/**
 * Returns a city-wide heatmap grid for map overlay.
 * Samples a coarse grid over Bengaluru bounding box and returns
 * {lat, lng, density} points above a threshold.
 */
export function getCityHeatmap(threshold = 0.15): Array<{ lat: number; lng: number; density: number }> {
  const state = train();
  const { points, bandwidth, globalMaxDensity } = state;

  // Bengaluru bounding box with 0.025° grid (~2.8km steps — lightweight)
  const LAT_MIN = 12.82, LAT_MAX = 13.10;
  const LNG_MIN = 77.46, LNG_MAX = 77.76;
  const STEP = 0.025;

  const result: Array<{ lat: number; lng: number; density: number }> = [];

  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += STEP) {
    for (let lng = LNG_MIN; lng <= LNG_MAX; lng += STEP) {
      const raw = kdeAt(lat, lng, points, bandwidth);
      const density = Math.min(1, raw / globalMaxDensity);
      if (density >= threshold) {
        result.push({ lat: +lat.toFixed(3), lng: +lng.toFixed(3), density: +density.toFixed(3) });
      }
    }
  }

  return result;
}

/** Force eager training at app init */
export function warmup() {
  train();
}
