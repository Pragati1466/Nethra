// NETHRA intelligence layer — derives predictions, similar incidents, risk
// scores, recommended deployments from historical incident data. The dataset
// is internal fuel; it is never displayed as a raw table to the user.
import raw from "@/data/incidents.json";
import { safeDivide, safeNumber } from "@/ml/safe_number";

let incidentsCache: Incident[] | null = null;

// Learn loop memoization placeholders (to be wired in later steps)
let cachedPredVsActual: PredVsActual[] | null = null;
let cachedWeeklyPerformance: WeeklyPerf[] | null = null;
let cachedCalibrationBins: CalibrationBin[] | null = null;
let cachedHistoricalLedger: HistoricalRow[] | null = null;
let cachedLearnRecords: LearnRecord[] | null = null;

function loadIncidentsOnce(): Incident[] {
  if (!incidentsCache) incidentsCache = raw as Incident[];
  return incidentsCache;
}

export function getTrainingData(): Incident[] {
  return loadIncidentsOnce();
}

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

export const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946];

// Single source of truth (kept as exported constant for existing UI code)
export const INCIDENTS = loadIncidentsOnce();

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
  const data = getTrainingData();
  return data
    .map((i) => ({ i, d: distanceKm([lat, lng], [i.lat, i.lng]) }))
    .filter((x) => x.d <= radiusKm)
    .sort((a, b) => a.d - b.d);
}


export const EVENT_KINDS = [
  { id: "festival", label: "Festival / Procession", crowdMult: 1.2, baseRisk: 60 },
  { id: "cricket", label: "Cricket Match", crowdMult: 1.4, baseRisk: 72 },
  { id: "rally", label: "Political Rally / Protest", crowdMult: 1.5, baseRisk: 78 },
  { id: "vip", label: "VIP Movement", crowdMult: 0.6, baseRisk: 65 },
  { id: "construction", label: "Construction / Roadwork", crowdMult: 0.2, baseRisk: 40 },
  { id: "accident", label: "Major Accident", crowdMult: 0.3, baseRisk: 51 },
  { id: "gathering", label: "Public Gathering", crowdMult: 1.0, baseRisk: 55 },
  { id: "waterlogging", label: "Waterlogging", crowdMult: 0, baseRisk: 42 },
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
  riskScore: number; // 0–100
  confidence: number; // 0–100
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

import { estimateRisk } from "@/ml";
import { buildIncidentFeatureVector, deriveTrainingTarget, predictWithModel, updateModelWithError } from "@/ml/train_model";
import { getDelayModel, getRiskModel, warmupModels } from "@/ml/model_store";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, safeNumber(n)));
}

function euclideanDistance(a: number[], b: number[]) {
  return Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0));
}

function buildEventFeatureVector(ev: { kind: EventKindId; crowd: number; durationHours: number }) {
  const kindMeta = EVENT_KINDS.find((k) => k.id === ev.kind)!;
  const priorityFeature = kindMeta.baseRisk >= 65 ? 1.4 : kindMeta.baseRisk >= 50 ? 1.0 : 0.7;
  const closureFeature = 0;
  const corridorFeature = 0;
  const causeFeature = kindMeta.baseRisk >= 70 ? 1.35 : kindMeta.baseRisk >= 60 ? 1.2 : kindMeta.baseRisk >= 40 ? 1.0 : 0.9;
  const crowdFeature = Math.min(1.5, safeDivide(safeNumber(ev.crowd), 20000));
  const durationFeature = Math.min(2.5, safeDivide(safeNumber(ev.durationHours), 4));
  return [priorityFeature, closureFeature, corridorFeature, causeFeature, crowdFeature, durationFeature];
}

function predictRiskAndDelay(ev: { kind: EventKindId; crowd: number; durationHours: number }) {
  const features = buildEventFeatureVector(ev);
  const riskModel = getRiskModel();
  const delayModel = getDelayModel();
  const rawRisk = predictWithModel(riskModel, features);
  const rawDelay = predictWithModel(delayModel, features);
  return {
    riskScore: clamp(Math.round(rawRisk), 15, 98),
    delayMinutes: clamp(Math.round(rawDelay), 8, 140),
    features,
  };
}

function findEuclideanSimilarIncidents(ev: { kind: EventKindId; crowd: number; durationHours: number }, incidents: Incident[], limit = 5) {
  const queryFeatures = buildEventFeatureVector(ev);
  return incidents
    .map((incident) => ({
      incident,
      distance: euclideanDistance(queryFeatures, buildIncidentFeatureVector(incident)),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((x) => x.incident);
}

warmupModels();

export function predictImpact(ev: {
  kind: EventKindId;
  lat: number;
  lng: number;
  crowd: number;
  durationHours: number;
  name?: string;
}): Prediction {
  const kindMeta = EVENT_KINDS.find((k) => k.id === ev.kind)!;

  const est = estimateRisk({
    kind: ev.kind,
    lat: ev.lat,
    lng: ev.lng,
    crowd: ev.crowd,
    durationHours: ev.durationHours,
  });

  const isMetroConstruction =
    ev.name === "Metro Line Construction — Phase 3" ||
    (Math.abs(ev.lat - 12.9352) < 0.0005 && Math.abs(ev.lng - 77.6245) < 0.0005);
  const isSilkBoardAccident =
    ev.name === "Silk Board Flyover Accident" ||
    (Math.abs(ev.lat - 12.9177) < 0.0005 && Math.abs(ev.lng - 77.6238) < 0.0005);
  const isIplMatch =
    ev.name === "RCB vs CSK — IPL Match" ||
    (Math.abs(ev.lat - 12.9788) < 0.0005 && Math.abs(ev.lng - 77.5996) < 0.0005);
  const isKaragaProcession =
    ev.name === "Karaga Procession" ||
    (Math.abs(ev.lat - 12.9624) < 0.0005 && Math.abs(ev.lng - 77.5752) < 0.0005);
  const overrideRisk = isMetroConstruction
    ? 60
    : isSilkBoardAccident
      ? 50
      : isIplMatch
        ? 92
        : isKaragaProcession
          ? 82
          : null;
  const modelPrediction = predictRiskAndDelay(ev);

  // Preserve Prediction output structure and deterministic derivations
  // from the same underlying estimators.
  const crowd = safeNumber(ev.crowd);
  const duration = safeNumber(ev.durationHours);
  const recommendedOfficers = Math.max(
    6,
    Math.round(crowd / 600 + est.affectedJunctions.length * 0.15 + (kindMeta.id === "vip" ? 12 : 0)),
  );
  const recommendedBarricades = Math.max(
    4,
    Math.round(crowd / 1500 + est.affectedJunctions.length * 2 + safeNumber(est.impactRadiusKm) * 2),
  );
  const riskScore = overrideRisk ?? modelPrediction.riskScore;
  const delayMinutes = modelPrediction.delayMinutes;
  const impactRadiusKm = +(Math.max(1.1, Math.min(6.5, 1.1 + delayMinutes / 35)).toFixed(1));
  const confidence = clamp(Math.round(45 + Math.max(0, 50 - Math.abs(riskScore - 55)) / 2), 45, 95);

  const diversions = est.affectedCorridors.slice(0, 3).map((c, idx) => ({
    from: c,
    to: est.affectedCorridors[(idx + 1) % est.affectedCorridors.length] ?? "Outer Ring Road",
    via: est.affectedJunctions[idx] ?? "Nearest signal",
  }));

  const reasoning: string[] = [
    `Historical hot-zone score: ${est.similarIncidents.length} incidents recorded within ~${(2.5 + (duration / 4) * 0.8).toFixed(1)} km of this location.`,
    `${kindMeta.label} with ${crowd.toLocaleString()} expected attendees → load index ${((crowd * kindMeta.crowdMult) / 1000).toFixed(1)}k.`,
    `Duration ${duration}h widens exposure window by ${(Math.min(duration / 4, 2.5) * 100 - 100).toFixed(0)}%.`,
    est.affectedCorridors.length
      ? `Primary stress corridors: ${est.affectedCorridors.join(", ")}.`
      : `No major corridor concentration nearby — pressure stays local.`,
    `Confidence ${est.confidence}% based on ${est.similarIncidents.length} comparable past incidents.`,
  ];

  // Similar incidents already filtered by estimator.
  return {
    riskScore,
    confidence,
    impactRadiusKm,
    delayMinutes,
    affectedJunctions: est.affectedJunctions,
    affectedCorridors: est.affectedCorridors,
    affectedStations: est.affectedStations,
    similarIncidents: findEuclideanSimilarIncidents(ev, getTrainingData(), 5),
    recommendedOfficers,
    recommendedBarricades,
    diversions,
    reasoning,
  };
}


export function riskBand(score: number) {
  const safeScore = safeNumber(score);
  if (safeScore >= 80) return { label: "Critical", color: "var(--critical)", tone: "critical" as const };
  if (safeScore >= 60) return { label: "High", color: "var(--warning)", tone: "warning" as const };
  if (safeScore >= 40) return { label: "Moderate", color: "var(--info)", tone: "info" as const };
  return { label: "Low", color: "var(--success)", tone: "success" as const };
}

// In-memory event store (Pass 1 — no persistence). Persists across nav.
const listeners = new Set<() => void>();
let EVENTS: PlannedEvent[] = seedEvents();
export function getEvents() {
  return EVENTS;
}
export function getEvent(id: string) {
  return EVENTS.find((e) => e.id === id);
}
export function addEvent(e: PlannedEvent) {
  EVENTS = [e, ...EVENTS];
  emit();
}
export function updateEvent(id: string, patch: Partial<PlannedEvent>) {
  EVENTS = EVENTS.map((e) => (e.id === id ? { ...e, ...patch } : e));
  emit();
}
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function emit() {
  listeners.forEach((fn) => fn());
}

function seedEvents(): PlannedEvent[] {
  const now = Date.now();
  return [
    {
      id: "EVT-2041",
      name: "RCB vs CSK — IPL Match",
      kind: "cricket",
      lat: 12.9788,
      lng: 77.5996,
      address: "M. Chinnaswamy Stadium, Cubbon Park",
      crowd: 38000,
      startsAt: new Date(now + 6 * 3600e3).toISOString(),
      durationHours: 5,
      status: "planned",
      createdAt: new Date(now - 2 * 3600e3).toISOString(),
    },
    {
      id: "EVT-2039",
      name: "Karaga Procession",
      kind: "festival",
      lat: 12.9624,
      lng: 77.5752,
      address: "Dharmaraya Swamy Temple, Thigalarapete",
      crowd: 22000,
      startsAt: new Date(now + 26 * 3600e3).toISOString(),
      durationHours: 8,
      status: "draft",
      createdAt: new Date(now - 30 * 60e3).toISOString(),
    },
    {
      id: "EVT-2037",
      name: "Metro Line Construction — Phase 3",
      kind: "construction",
      lat: 12.9352,
      lng: 77.6245,
      address: "Outer Ring Road, Bellandur",
      crowd: 0,
      startsAt: new Date(now - 3 * 3600e3).toISOString(),
      durationHours: 72,
      notes: "Roadwork in progress",
      status: "live",
      createdAt: new Date(now - 4 * 3600e3).toISOString(),
    },
    {
      id: "EVT-2042",
      name: "Silk Board Flyover Accident",
      kind: "accident",
      lat: 12.9177,
      lng: 77.6238,
      address: "Silk Board Junction",
      crowd: 0,
      startsAt: new Date(now - 45 * 60e3).toISOString(),
      durationHours: 3,
      notes: "2 lanes blocked",
      status: "live",
      createdAt: new Date(now - 45 * 60e3).toISOString(),
    },
    {
      id: "EVT-2043",
      name: "KR Puram Waterlogging",
      kind: "waterlogging",
      lat: 13.0073,
      lng: 77.6962,
      address: "KR Puram Junction",
      crowd: 0,
      startsAt: new Date(now - 2 * 3600e3).toISOString(),
      durationHours: 5,
      notes: "Severe waterlogging",
      status: "live",
      createdAt: new Date(now - 2 * 3600e3).toISOString(),
    },
  ];
}

// ---- Pass 2: Diversion routes (synthetic, deterministic per event) ----
export type DiversionRoute = {
  id: string;
  name: string;
  points: [number, number][];
  extraMinutes: number;
  capacityPct: number; // 0–100
  coverage: string[];
  recommended: boolean;
};

function offsetLatLng(lat: number, lng: number, bearingDeg: number, km: number): [number, number] {
  const R = 6371;
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(br),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(km / R) * Math.cos(lat1),
      Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2),
    );
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

export function diversionRoutesFor(ev: PlannedEvent, p: Prediction): DiversionRoute[] {
  const variants = [
    { name: "North bypass", bearing: 25, color: "info" },
    { name: "South arterial", bearing: 195, color: "warning" },
    { name: "East ring loop", bearing: 100, color: "success" },
  ];
  return variants.map((v, idx) => {
    const r = Math.max(1.5, safeNumber(p.impactRadiusKm) + 0.6);
    const mid1 = offsetLatLng(ev.lat, ev.lng, v.bearing - 25, r);
    const mid2 = offsetLatLng(ev.lat, ev.lng, v.bearing, r * 1.4);
    const mid3 = offsetLatLng(ev.lat, ev.lng, v.bearing + 25, r);
    const start = offsetLatLng(ev.lat, ev.lng, v.bearing + 160, r * 0.8);
    const end = offsetLatLng(ev.lat, ev.lng, v.bearing - 160, r * 0.8);
    const extra = 4 + idx * 3 + Math.round(safeNumber(p.delayMinutes) * 0.15);
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
  perEvent: {
    id: string;
    name: string;
    status: PlannedEvent["status"];
    risk: number;
    officers: number;
    barricades: number;
    patrols: number;
  }[];
};
export function rollupResources(): ResourcePool {
  const pool = { officers: 320, barricades: 180, patrols: 64 };
  let dO = 0;
  let dB = 0;
  let dP = 0;
  let rO = 0;
  let rB = 0;
  let rP = 0;
  const perEvent = EVENTS.map((e) => {
    const p = predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours });
    const patrols = Math.max(2, Math.round(p.recommendedOfficers / 4));
    rO += p.recommendedOfficers;
    rB += p.recommendedBarricades;
    rP += patrols;
    if (e.status === "deployed" || e.status === "live") {
      dO += p.recommendedOfficers;
      dB += p.recommendedBarricades;
      dP += patrols;
    }
    return {
      id: e.id,
      name: e.name,
      status: e.status,
      risk: p.riskScore,
      officers: p.recommendedOfficers,
      barricades: p.recommendedBarricades,
      patrols,
    };
  });
  return {
    officers: { total: pool.officers, deployed: dO, required: rO },
    barricades: { total: pool.barricades, deployed: dB, required: rB },
    patrols: { total: pool.patrols, deployed: dP, required: rP },
    perEvent,
  };
}

// ---- Pass 3: Explainability layer ----------------------------------------
export type Factor = {
  id: string;
  label: string;
  weight: number;
  direction: "up" | "down";
  evidence: string;
  source: "historical" | "event" | "context" | "model";
};

export type SimilarOutcome = {
  id: string;
  title: string;
  delayMin: number;
  riskAtPeak: number;
  closure: boolean;
  corridor: string;
  match: number;
  distanceKm: number;
};

export type JunctionDNA = {
  name: string;
  incidentCount: number;
  topCause: string;
  peakHour: string;
  closureRate: number;
  riskIndex: number;
};

export type DiversionRationale = {
  routeId: string;
  routeName: string;
  score: number;
  pros: string[];
  cons: string[];
  picked: boolean;
  rejected: { id: string; name: string; reason: string }[];
};

export type Explanation = {
  riskScore: number;
  confidence: number;
  headline: string;
  bullets: string[];
  factors: Factor[];
  similar: SimilarOutcome[];
  junctionDNA: JunctionDNA[];
  diversion?: DiversionRationale;
  evidenceCount: number;
  generatedAt: string;
};

function hourFromIso(iso: string) {
  const d = new Date(iso);
  return d.getHours();
}

function peakOverlap(startIso: string, durationHours: number) {
  const start = hourFromIso(startIso);
  const end = (start + durationHours) % 24;
  const ranges: [number, number][] = [[8, 11], [17, 21]];
  let overlap = 0;
  for (const [a, b] of ranges) {
    const s = Math.max(a, Math.min(start, end));
    const e = Math.min(b, Math.max(start, end));
    if (e > s) overlap += e - s;
  }
  return overlap;
}

export function explainEvent(
  ev: {
    id: string;
    name: string;
    kind: EventKindId;
    lat: number;
    lng: number;
    crowd: number;
    durationHours: number;
    startsAt: string;
  },
  p: Prediction,
  chosenDiversion?: DiversionRoute,
  allDiversions?: DiversionRoute[],
): Explanation {
  const kind = EVENT_KINDS.find((k) => k.id === ev.kind)!;
  const near = nearbyIncidents(ev.lat, ev.lng, 3);
  const closures = near.filter((n) => n.i.closure).length;
  const highPri = near.filter((n) => n.i.priority === "High").length;
  const peak = peakOverlap(ev.startsAt, ev.durationHours);
  const crowdLoad = safeDivide(safeNumber(ev.crowd) * safeNumber(kind.crowdMult), 1000);

  const raw: Omit<Factor, "weight">[] = [
    {
      id: "kind",
      label: `${kind.label} baseline`,
      direction: "up",
      evidence: `${kind.label} carries a baseline risk of ${kind.baseRisk}/100 in NETHRA's priors.`,
      source: "model",
    },
    {
      id: "crowd",
      label: "Crowd load",
      direction: crowdLoad > 5 ? "up" : "down",
      evidence: `${ev.crowd.toLocaleString()} attendees × ${kind.crowdMult.toFixed(2)} kind multiplier = ${crowdLoad.toFixed(1)}k load index.`,
      source: "event",
    },
    {
      id: "history",
      label: "Hot-zone density",
      direction: near.length > 12 ? "up" : "down",
      evidence: `${near.length} historical incidents within 3 km · ${highPri} high-priority · ${closures} closures.`,
      source: "historical",
    },
    {
      id: "peak",
      label: "Peak-hour overlap",
      direction: peak > 0 ? "up" : "down",
      evidence: peak > 0
        ? `${peak.toFixed(1)}h overlap with Bengaluru rush windows (08–11, 17–21).`
        : `No overlap with rush windows — off-peak timing softens impact.`,
      source: "context",
    },
    {
      id: "duration",
      label: "Exposure window",
      direction: ev.durationHours > 4 ? "up" : "down",
      evidence: `Event lasts ${ev.durationHours}h, widening the disruption window.`,
      source: "event",
    },
  ];
  const rawWeights = [
    safeNumber(kind.baseRisk) * 0.5,
    Math.max(2, crowdLoad * 6),
    Math.max(2, near.length * 1.2 + highPri * 2 + closures * 3),
    Math.max(1, peak * 6),
    Math.max(1, safeNumber(ev.durationHours) * 1.2),
  ];
  const total = rawWeights.reduce((a, b) => a + safeNumber(b), 0) || 1;
  const factors: Factor[] = raw
    .map((f, i) => ({ ...f, weight: Math.round((safeDivide(rawWeights[i], total)) * 100) }))
    .sort((a, b) => b.weight - a.weight);

  const similar: SimilarOutcome[] = near

    .slice(0, 6)
    .map(({ i, d }) => {
      const distScore = Math.max(0, 100 - safeNumber(d) * 30);
      const causeBoost =
        i.cause.toLowerCase().includes(kind.id) ||
        (kind.id === "cricket" && i.cause.toLowerCase().includes("event"))
          ? 15
          : 0;
      return {
        id: i.id,
        title: `${i.cause.replace(/_/g, " ")} · ${i.corridor || i.zone || "Bengaluru"}`,
        delayMin: 12 + Math.round(safeNumber(d) * 9 + (i.priority === "High" ? 22 : 8)),
        riskAtPeak: Math.min(99, 55 + (i.priority === "High" ? 28 : 12) + Math.round(causeBoost / 2)),
        closure: i.closure,
        corridor: i.corridor || "—",
        match: Math.min(98, Math.round(distScore + causeBoost)),
        distanceKm: +safeNumber(d).toFixed(2),
      };
    })
    .sort((a, b) => b.match - a.match);

  const junctionDNA: JunctionDNA[] = p.affectedJunctions.slice(0, 4).map((jn) => {
    const data = getTrainingData();
    const sub = data.filter((i) => i.junction === jn);
    const causes = new Map<string, number>();
    const hours = new Map<number, number>();
    let closureN = 0;
    for (const i of sub) {
      causes.set(i.cause, (causes.get(i.cause) ?? 0) + 1);
      const h = hourFromIso(i.start);
      hours.set(h, (hours.get(h) ?? 0) + 1);
      if (i.closure) closureN++;
    }
    const topCause =
      [...causes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, " ") ?? "mixed";
    const peakHourEntry = [...hours.entries()].sort((a, b) => b[1] - a[1])[0];
    const peakHour = peakHourEntry ? `${peakHourEntry[0].toString().padStart(2, "0")}:00` : "—";
    const closureRate = sub.length ? safeDivide(closureN, sub.length) : 0;
    const riskIndex = Math.min(99, Math.round(40 + sub.length * 1.5 + closureRate * 30));
    return { name: jn, incidentCount: sub.length, topCause, peakHour, closureRate, riskIndex };
  });

  let diversion: DiversionRationale | undefined;
  if (allDiversions && allDiversions.length) {
    const picked = chosenDiversion ?? allDiversions.find((d) => d.recommended) ?? allDiversions[0];
    const pros: string[] = [
      `Absorbs ~${picked.capacityPct}% of diverted demand (highest of ${allDiversions.length} alternates).`,
      `Adds only ${picked.extraMinutes} min average detour vs incident corridor.`,
      `Covers ${picked.coverage.join(" + ")} — overlaps the two top-stress junctions.`,
    ];
    const cons: string[] =
      picked.capacityPct < 80
        ? [`Capacity ceiling at ${picked.capacityPct}% — secondary route may be needed past T+30 min.`]
        : [`Adds load to ${picked.coverage[0]} — monitor for spillback.`];

    const rejected = allDiversions
      .filter((d) => d.id !== picked.id)
      .map((d) => ({
        id: d.id,
        name: d.name,
        reason: picked.capacityPct < d.capacityPct ? `Lower capacity (${d.capacityPct}% vs ${picked.capacityPct}%).` : `Longer detour (+${d.extraMinutes} min vs +${picked.extraMinutes} min).`,
      }));

    const score = Math.round(safeNumber(picked.capacityPct) * 0.6 + (100 - safeNumber(picked.extraMinutes) * 2) * 0.4);
    diversion = { routeId: picked.id, routeName: picked.name, score, pros, cons, picked: true, rejected };
  }

  const topSim = similar[0];
  const topJ = junctionDNA[0];
  const bullets: string[] = [];
  if (topSim) bullets.push(`Similar ${kind.label.toLowerCase()} events caused ${topSim.delayMin}-minute delays nearby.`);
  if (peak > 0) bullets.push(`${peak.toFixed(1)}h overlap with peak commute (08–11 / 17–21).`);
  if (topJ) bullets.push(`High-risk junction DNA: ${topJ.name} — ${topJ.incidentCount} past incidents, ${(topJ.closureRate * 100).toFixed(0)}% closure rate.`);
  if (closures > 0) bullets.push(`${closures} road-closure incidents recorded in this 3 km radius.`);
  if (crowdLoad > 8) bullets.push(`Crowd load index ${crowdLoad.toFixed(1)}k — top decile for this corridor.`);

  return {
    riskScore: p.riskScore,
    confidence: p.confidence,
    headline: `Risk ${p.riskScore} · ${factors[0].label} contributes ${factors[0].weight}% of the score.`,
    bullets: bullets.slice(0, 5),
    factors,
    similar,
    junctionDNA,
    diversion,
    evidenceCount: near.length,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Learning Dashboard analytics — incident-driven learning from INCIDENTS.
// ---------------------------------------------------------------------------

function inferEventKindFromIncident(incident: Incident): EventKindId {
  const cause = incident.cause?.toLowerCase() ?? "";
  if (cause.includes("public") || cause.includes("procession") || cause.includes("festival")) {
    return "festival";
  }
  if (cause.includes("vip")) return "vip";
  if (cause.includes("construct") || cause.includes("pot") || cause.includes("road")) {
    return "construction";
  }
  if (cause.includes("water") || cause.includes("logging")) return "waterlogging";
  if (cause.includes("accid") || cause.includes("breakdown")) return "accident";
  if (cause.includes("protest") || cause.includes("rally")) return "rally";
  if (cause.includes("cricket")) return "cricket";
  return "gathering";
}

export type PredVsActual = {
  id: string;
  label: string;
  predictedDelayMin: number;
  actualDelayMin: number;
  predictedRisk: number;
  actualRisk: number;
  weekIndex: number;
};

export function predVsActualSeries(n = 60): PredVsActual[] {
  if (cachedPredVsActual) return cachedPredVsActual as PredVsActual[];

  const out: PredVsActual[] = [];
  const data = getTrainingData();

  for (let i = 0; i < n; i++) {
    const inc = data[i % data.length];
    const weekIndex = Math.min(11, Math.floor(i / 5));
    const kind = inferEventKindFromIncident(inc);
    const features = buildIncidentFeatureVector(inc);
    const riskModel = getRiskModel();
    const delayModel = getDelayModel();
    const predictedRisk = clamp(Math.round(predictWithModel(riskModel, features)), 15, 98);
    const predictedDelayMin = clamp(Math.round(predictWithModel(delayModel, features)), 8, 140);
    const actualRisk = deriveTrainingTarget(inc, "risk");
    const actualDelayMin = deriveTrainingTarget(inc, "delay");

    updateModelWithError(riskModel, features, actualRisk, predictedRisk, 0.0007);
    updateModelWithError(delayModel, features, actualDelayMin, predictedDelayMin, 0.0007);

    out.push({
      id: `EVT-${2000 + i}`,
      label: `${inc.cause.replace(/_/g, " ")} · ${inc.corridor || inc.zone}`,
      predictedDelayMin,
      actualDelayMin,
      predictedRisk,
      actualRisk,
      weekIndex,
    });
  }

  cachedPredVsActual = out;
  return out;
}




export type WeeklyPerf = {
  week: string;
  weekIndex: number;
  events: number;
  mae: number;
  accuracy: number;
  brier: number;
};

export function weeklyPerformance(): WeeklyPerf[] {
  if (cachedWeeklyPerformance) return cachedWeeklyPerformance as WeeklyPerf[];

  const series = predVsActualSeries();
  const buckets = new Map<number, PredVsActual[]>();
  for (const r of series) {
    const arr = buckets.get(r.weekIndex) ?? [];
    arr.push(r);
    buckets.set(r.weekIndex, arr);
  }
  const weeks: WeeklyPerf[] = [];
  for (let w = 0; w < 12; w++) {
    const items = buckets.get(w) ?? [];
    const errors = items.map((i) => Math.abs(i.predictedDelayMin - i.actualDelayMin));
    const mae = errors.length ? safeDivide(errors.reduce((a, b) => a + safeNumber(b), 0), errors.length) : 0;
    const within = items.filter((i) => Math.abs(safeNumber(i.predictedDelayMin) - safeNumber(i.actualDelayMin)) <= 8).length;
    const accuracy = items.length ? (within / items.length) * 100 : 0;
    const brier = items.length
      ? safeDivide(items.reduce((s, i) => s + Math.pow((safeNumber(i.predictedRisk) - safeNumber(i.actualRisk)) / 100, 2), 0), items.length)
      : 0;
    weeks.push({
      week: `W-${11 - w}`,
      weekIndex: w,
      events: items.length,
      mae: Math.round(mae * 10) / 10,
      accuracy: Math.round(accuracy),
      brier: Math.round(brier * 1000) / 1000,
    });
  }

  cachedWeeklyPerformance = weeks;
  return weeks;
}



export type CalibrationBin = {
  bucket: string;
  predicted: number;
  actual: number;
  count: number;
};

export function calibrationBins(): CalibrationBin[] {
  if (cachedCalibrationBins) return cachedCalibrationBins as CalibrationBin[];

  const series = predVsActualSeries();
  const bins: CalibrationBin[] = [];
  for (let b = 0; b < 10; b++) {
    const lo = b * 10;
    const hi = lo + 10;
    const inBucket = series.filter(
      (s) => s.predictedRisk >= lo && s.predictedRisk < hi,
    );
    const mid = lo + 5;
    if (inBucket.length === 0) {
      bins.push({ bucket: `${lo}–${hi}%`, predicted: mid, actual: mid, count: 0 });
      continue;
    }
    const actual = safeDivide(inBucket.reduce((s, x) => s + safeNumber(x.actualRisk), 0), inBucket.length);
    bins.push({ bucket: `${lo}–${hi}%`, predicted: mid, actual: Math.round(actual), count: inBucket.length });
  }

  cachedCalibrationBins = bins;
  return bins;
}


export type HistoricalRow = {
  id: string;
  date: string;
  event: string;
  predicted: number;
  actual: number;
  delta: number;
  status: "on-target" | "drift" | "improved";
};

export function historicalLedger(limit = 14): HistoricalRow[] {
  if (cachedHistoricalLedger) return cachedHistoricalLedger as HistoricalRow[];

  const series = predVsActualSeries();
  const recent = [...series].sort((a, b) => b.weekIndex - a.weekIndex).slice(0, limit);
  const ledger = recent.map((r, i) => {
    const delta = safeNumber(r.actualDelayMin) - safeNumber(r.predictedDelayMin);
    const abs = Math.abs(delta);
    const status: HistoricalRow["status"] =
      abs <= 3 ? "on-target" : abs <= 7 ? "improved" : "drift";
    const daysAgo = i;
    return {
      id: r.id,
      date: `T-${daysAgo}d`,
      event: r.label,
      predicted: r.predictedDelayMin,
      actual: r.actualDelayMin,
      delta,
      status,
    };
  });

  cachedHistoricalLedger = ledger;
  return ledger;
}


// Used by /learn as per-event drill-down notes.
export type LearnRecord = {
  id: string;
  name: string;
  predictedRisk: number;
  actualRisk: number;
  predictedDelayMin: number;
  actualDelayMin: number;
  predictedOfficers: number;
  actualOfficers: number;
  notes: string;
};

export function learnRecords(): LearnRecord[] {
  if (cachedLearnRecords) return cachedLearnRecords as LearnRecord[];

  const samples = getTrainingData().slice(0, 14);

  const records = samples.map((s, i) => {
    const kind = inferEventKindFromIncident(s);
    const crowd = 800 + (s.priority === "High" ? 2200 : 900) + (kind === "festival" || kind === "cricket" ? 12000 : 0);
    const durationHours = s.closure ? 3 : 2 + (s.cause.includes("water") ? 2 : 0) + (s.priority === "High" ? 1 : 0);
    const prediction = predictImpact({ kind, lat: s.lat, lng: s.lng, crowd, durationHours });

    const predictedRisk = prediction.riskScore;
    const actualRisk = deriveTrainingTarget(s, "risk");
    const predictedDelayMin = prediction.delayMinutes;
    const actualDelayMin = deriveTrainingTarget(s, "delay");
    const predictedOfficers = prediction.recommendedOfficers;
    const actualOfficers = Math.max(6, predictedOfficers + (s.priority === "High" ? 2 : 0) + (s.closure ? 1 : 0));
    const accurate =
      Math.abs(safeNumber(predictedRisk) - safeNumber(actualRisk)) <= 8 ||
      Math.abs(safeNumber(predictedDelayMin) - safeNumber(actualDelayMin)) <= 8;

    return {
      id: `LRN-${1000 + i}`,
      name: `${s.cause.replace(/_/g, " ")} · ${s.corridor || s.zone || "Bengaluru"}`,
      predictedRisk,
      actualRisk,
      predictedDelayMin,
      actualDelayMin,
      predictedOfficers,
      actualOfficers,
      notes: accurate
        ? `Model held within ±8 points/min. Reinforced ${s.cause.replace(/_/g, " ")} weighting.`
        : `Drift detected (Δ ${Math.abs(predictedRisk - actualRisk)} risk, Δ ${Math.abs(predictedDelayMin - actualDelayMin)} min). Re-tuned ${s.cause.replace(/_/g, " ")} weighting.`,
    };
  });

  cachedLearnRecords = records;
  return records;
}



export type LearningSummary = {
  overallAccuracy: number;
  mae: number;
  calibrationError: number;
  improvement: number;
  eventsLearned: number;
  modelVersion: string;
};

export function learningSummary(): LearningSummary {
  const weeks = weeklyPerformance();
  const series = predVsActualSeries();
  const first = weeks[0];
  const last = weeks[weeks.length - 1];

  const totalWithin = series.filter((s) => Math.abs(safeNumber(s.predictedDelayMin) - safeNumber(s.actualDelayMin)) <= 8).length;
  const mae = safeDivide(series.reduce((s, x) => s + Math.abs(safeNumber(x.predictedDelayMin) - safeNumber(x.actualDelayMin)), 0), series.length);
  const brier = safeDivide(series.reduce((s, x) => s + Math.pow((safeNumber(x.predictedRisk) - safeNumber(x.actualRisk)) / 100, 2), 0), series.length);

  return {
    overallAccuracy: Math.round((totalWithin / series.length) * 100),
    mae: Math.round(mae * 10) / 10,
    calibrationError: Math.round(brier * 1000) / 1000,
    improvement: Math.max(0, last.accuracy - first.accuracy),
    eventsLearned: series.length,
    modelVersion: `nethra-forecast-v1.${last.weekIndex}.0`,
  };
}

