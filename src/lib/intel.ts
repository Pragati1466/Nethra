// NETHRA intelligence layer — derives predictions, similar incidents, risk
// scores, recommended deployments from historical incident data. The dataset
// is internal fuel; it is never displayed as a raw table to the user.
import raw from "@/data/incidents.json";

export type Incident = {
  id: string;
  type: string;
  cause: string;
  lat: number;
  lng: number;
  corridor: string;
  priority: string;
  zone: string;
  junction: string;
  station: string;
  start: string;
  closure: boolean;
};

export const INCIDENTS = raw as Incident[];

export const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946];

const R = 6371; // km
export function distanceKm(a: [number, number], b: [number, number]) {
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearbyIncidents(lat: number, lng: number, radiusKm = 2) {
  return INCIDENTS.map((i) => ({ i, d: distanceKm([lat, lng], [i.lat, i.lng]) }))
    .filter((x) => x.d <= radiusKm)
    .sort((a, b) => a.d - b.d);
}

export const EVENT_KINDS = [
  { id: "festival", label: "Festival / Procession", crowdMult: 1.2, baseRisk: 60 },
  { id: "cricket", label: "Cricket Match", crowdMult: 1.4, baseRisk: 72 },
  { id: "rally", label: "Political Rally / Protest", crowdMult: 1.5, baseRisk: 78 },
  { id: "vip", label: "VIP Movement", crowdMult: 0.6, baseRisk: 65 },
  { id: "construction", label: "Construction / Roadwork", crowdMult: 0.2, baseRisk: 40 },
  { id: "accident", label: "Major Accident", crowdMult: 0.3, baseRisk: 70 },
  { id: "gathering", label: "Public Gathering", crowdMult: 1.0, baseRisk: 55 },
] as const;
export type EventKindId = typeof EVENT_KINDS[number]["id"];

export type PlannedEvent = {
  id: string;
  name: string;
  kind: EventKindId;
  lat: number;
  lng: number;
  address: string;
  crowd: number;
  startsAt: string; // ISO
  durationHours: number;
  notes?: string;
  status: "draft" | "planned" | "deployed" | "live" | "closed";
  createdAt: string;
};

export type Prediction = {
  riskScore: number;            // 0–100
  confidence: number;           // 0–100
  impactRadiusKm: number;
  delayMinutes: number;
  affectedJunctions: string[];
  affectedCorridors: string[];
  affectedStations: string[];
  similarIncidents: Incident[];
  recommendedOfficers: number;
  recommendedBarricades: number;
  diversions: { from: string; to: string; via: string }[];
  reasoning: string[];
};

export function predictImpact(ev: {
  kind: EventKindId; lat: number; lng: number; crowd: number; durationHours: number;
}): Prediction {
  const kind = EVENT_KINDS.find((k) => k.id === ev.kind)!;
  const near = nearbyIncidents(ev.lat, ev.lng, 3);
  const closeBy = near.slice(0, 60);

  const corridorMix = new Map<string, number>();
  const junctionMix = new Map<string, number>();
  const stationMix = new Map<string, number>();
  for (const { i } of closeBy) {
    if (i.corridor) corridorMix.set(i.corridor, (corridorMix.get(i.corridor) ?? 0) + 1);
    if (i.junction && i.junction !== "NULL") junctionMix.set(i.junction, (junctionMix.get(i.junction) ?? 0) + 1);
    if (i.station) stationMix.set(i.station, (stationMix.get(i.station) ?? 0) + 1);
  }
  const topN = (m: Map<string, number>, n: number) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map((x) => x[0]);

  const affectedCorridors = topN(corridorMix, 3);
  const affectedJunctions = topN(junctionMix, 4);
  const affectedStations = topN(stationMix, 3);

  const density = closeBy.length;                       // historical hot zone?
  const crowdLoad = (ev.crowd * kind.crowdMult) / 1000; // ~k people
  const durationFactor = Math.min(ev.durationHours / 4, 2.5);

  let risk = kind.baseRisk + crowdLoad * 4 + density * 0.4 + durationFactor * 6;
  risk = Math.max(15, Math.min(98, Math.round(risk)));

  const confidence = Math.max(45, Math.min(95, 55 + Math.min(35, density)));
  const impactRadiusKm = +(1 + crowdLoad * 0.25 + durationFactor * 0.3).toFixed(1);
  const delayMinutes = Math.round(8 + crowdLoad * 6 + density * 0.6 + durationFactor * 5);

  const recommendedOfficers = Math.max(
    6,
    Math.round(ev.crowd / 600 + density * 0.15 + (kind.id === "vip" ? 12 : 0)),
  );
  const recommendedBarricades = Math.max(
    4,
    Math.round(ev.crowd / 1500 + affectedJunctions.length * 2 + impactRadiusKm * 2),
  );

  const diversions = affectedCorridors.slice(0, 3).map((c, idx) => ({
    from: c,
    to: affectedCorridors[(idx + 1) % affectedCorridors.length] ?? "Outer Ring Road",
    via: affectedJunctions[idx] ?? "Nearest signal",
  }));

  const reasoning: string[] = [
    `Historical hot-zone score: ${density} incidents recorded within 3 km of this location.`,
    `${kind.label} with ${ev.crowd.toLocaleString()} expected attendees → load index ${crowdLoad.toFixed(1)}k.`,
    `Duration ${ev.durationHours}h widens exposure window by ${(durationFactor * 100 - 100).toFixed(0)}%.`,
    affectedCorridors.length
      ? `Primary stress corridors: ${affectedCorridors.join(", ")}.`
      : `No major corridor concentration nearby — pressure stays local.`,
    `Confidence ${confidence}% based on ${closeBy.length} comparable past incidents.`,
  ];

  return {
    riskScore: risk,
    confidence,
    impactRadiusKm,
    delayMinutes,
    affectedJunctions,
    affectedCorridors,
    affectedStations,
    similarIncidents: closeBy.slice(0, 8).map((x) => x.i),
    recommendedOfficers,
    recommendedBarricades,
    diversions,
    reasoning,
  };
}

export function riskBand(score: number) {
  if (score >= 80) return { label: "Critical", color: "var(--critical)", tone: "critical" as const };
  if (score >= 60) return { label: "High", color: "var(--warning)", tone: "warning" as const };
  if (score >= 40) return { label: "Moderate", color: "var(--info)", tone: "info" as const };
  return { label: "Low", color: "var(--success)", tone: "success" as const };
}

// In-memory event store (Pass 1 — no persistence). Persists across nav.
const listeners = new Set<() => void>();
let EVENTS: PlannedEvent[] = seedEvents();
export function getEvents() { return EVENTS; }
export function getEvent(id: string) { return EVENTS.find((e) => e.id === id); }
export function addEvent(e: PlannedEvent) { EVENTS = [e, ...EVENTS]; emit(); }
export function updateEvent(id: string, patch: Partial<PlannedEvent>) {
  EVENTS = EVENTS.map((e) => (e.id === id ? { ...e, ...patch } : e));
  emit();
}
export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function emit() { listeners.forEach((fn) => fn()); }

function seedEvents(): PlannedEvent[] {
  const now = Date.now();
  return [
    {
      id: "EVT-2041",
      name: "RCB vs CSK — IPL Match",
      kind: "cricket",
      lat: 12.9788, lng: 77.5996, address: "M. Chinnaswamy Stadium, Cubbon Park",
      crowd: 38000, startsAt: new Date(now + 6 * 3600e3).toISOString(),
      durationHours: 5, status: "planned", createdAt: new Date(now - 2 * 3600e3).toISOString(),
    },
    {
      id: "EVT-2039",
      name: "Karaga Procession",
      kind: "festival",
      lat: 12.9624, lng: 77.5752, address: "Dharmaraya Swamy Temple, Thigalarapete",
      crowd: 22000, startsAt: new Date(now + 26 * 3600e3).toISOString(),
      durationHours: 8, status: "draft", createdAt: new Date(now - 30 * 60e3).toISOString(),
    },
    {
      id: "EVT-2037",
      name: "Metro Line Construction — Phase 3",
      kind: "construction",
      lat: 12.9352, lng: 77.6245, address: "Outer Ring Road, Bellandur",
      crowd: 0, startsAt: new Date(now - 3 * 3600e3).toISOString(),
      durationHours: 72, status: "live", createdAt: new Date(now - 4 * 3600e3).toISOString(),
    },
  ];
}

// ---- Pass 2: Diversion routes (synthetic, deterministic per event) ----
export type DiversionRoute = {
  id: string;
  name: string;
  points: [number, number][];
  extraMinutes: number;
  capacityPct: number;     // 0–100, how much demand it absorbs
  coverage: string[];      // junctions/corridors covered
  recommended: boolean;
};

function offsetLatLng(lat: number, lng: number, bearingDeg: number, km: number): [number, number] {
  const R = 6371;
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(br));
  const lng2 = lng1 + Math.atan2(Math.sin(br) * Math.sin(km / R) * Math.cos(lat1), Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2));
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

export function diversionRoutesFor(ev: PlannedEvent, p: Prediction): DiversionRoute[] {
  const variants = [
    { name: "North bypass", bearing: 25, color: "info" },
    { name: "South arterial", bearing: 195, color: "warning" },
    { name: "East ring loop", bearing: 100, color: "success" },
  ];
  return variants.map((v, idx) => {
    const r = Math.max(1.5, p.impactRadiusKm + 0.6);
    const mid1 = offsetLatLng(ev.lat, ev.lng, v.bearing - 25, r);
    const mid2 = offsetLatLng(ev.lat, ev.lng, v.bearing, r * 1.4);
    const mid3 = offsetLatLng(ev.lat, ev.lng, v.bearing + 25, r);
    const start = offsetLatLng(ev.lat, ev.lng, v.bearing + 160, r * 0.8);
    const end = offsetLatLng(ev.lat, ev.lng, v.bearing - 160, r * 0.8);
    const extra = 4 + idx * 3 + Math.round(p.delayMinutes * 0.15);
    const capacity = 85 - idx * 12;
    return {
      id: `${ev.id}-DV-${idx + 1}`,
      name: v.name,
      points: [start, mid1, mid2, mid3, end],
      extraMinutes: extra,
      capacityPct: capacity,
      coverage: [
        p.affectedCorridors[idx % Math.max(1, p.affectedCorridors.length)] ?? "Outer Ring Road",
        p.affectedJunctions[idx % Math.max(1, p.affectedJunctions.length)] ?? "Nearest signal",
      ],
      recommended: idx === 0,
    };
  });
}

// ---- Pass 2: Citywide resource roll-up ----
export type ResourcePool = {
  officers: { total: number; deployed: number; required: number };
  barricades: { total: number; deployed: number; required: number };
  patrols: { total: number; deployed: number; required: number };
  perEvent: { id: string; name: string; status: PlannedEvent["status"]; risk: number; officers: number; barricades: number; patrols: number }[];
};
export function rollupResources(): ResourcePool {
  const pool = { officers: 320, barricades: 180, patrols: 64 };
  let dO = 0, dB = 0, dP = 0, rO = 0, rB = 0, rP = 0;
  const perEvent = EVENTS.map((e) => {
    const p = predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours });
    const patrols = Math.max(2, Math.round(p.recommendedOfficers / 4));
    rO += p.recommendedOfficers; rB += p.recommendedBarricades; rP += patrols;
    if (e.status === "deployed" || e.status === "live") {
      dO += p.recommendedOfficers; dB += p.recommendedBarricades; dP += patrols;
    }
    return { id: e.id, name: e.name, status: e.status, risk: p.riskScore,
      officers: p.recommendedOfficers, barricades: p.recommendedBarricades, patrols };
  });
  return {
    officers: { total: pool.officers, deployed: dO, required: rO },
    barricades: { total: pool.barricades, deployed: dB, required: rB },
    patrols: { total: pool.patrols, deployed: dP, required: rP },
    perEvent,
  };
}

// ---- Pass 2: Learn loop (predicted vs actual for closed events) ----
export type LearnRecord = {
  id: string; name: string; predictedRisk: number; actualRisk: number;
  predictedDelayMin: number; actualDelayMin: number;
  predictedOfficers: number; actualOfficers: number;
  notes: string;
};
export function learnRecords(): LearnRecord[] {
  // Synthesize a handful of "closed" outcomes using historical incidents as ground truth.
  const samples = INCIDENTS.slice(0, 6);
  return samples.map((s, i) => {
    const predictedRisk = 55 + (i * 7) % 40;
    const actualRisk = Math.max(20, Math.min(99, predictedRisk + ((i % 2 === 0 ? 1 : -1) * (4 + i))));
    const predictedDelayMin = 14 + (i * 5) % 22;
    const actualDelayMin = Math.max(4, predictedDelayMin + ((i % 3) - 1) * 6);
    const predictedOfficers = 18 + i * 3;
    const actualOfficers = Math.max(6, predictedOfficers - (i % 2 === 0 ? 2 : -3));
    const accurate = Math.abs(predictedRisk - actualRisk) <= 8;
    return {
      id: `LRN-${1000 + i}`,
      name: `${s.cause.replace(/_/g, " ")} · ${s.corridor || s.zone || "Bengaluru"}`,
      predictedRisk, actualRisk, predictedDelayMin, actualDelayMin,
      predictedOfficers, actualOfficers,
      notes: accurate
        ? `Model held within ±8 points. Reinforced ${s.corridor || "corridor"} weighting.`
        : `Drift detected (Δ ${Math.abs(predictedRisk - actualRisk)}). Re-tuned ${s.cause.replace(/_/g, " ")} priors.`,
    };
  });
}
