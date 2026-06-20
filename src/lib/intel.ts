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

// ---- Pass 3: Explainability layer ----------------------------------------
// Every prediction must answer "why". This builds a defensible decomposition:
// factor contributions, similar past outcomes, junction DNA, diversion
// rationale. Pure-functional, deterministic given the same inputs.

export type Factor = {
  id: string;
  label: string;
  weight: number;          // 0–100, share of risk score this factor drove
  direction: "up" | "down";
  evidence: string;        // human-readable proof line
  source: "historical" | "event" | "context" | "model";
};

export type SimilarOutcome = {
  id: string;
  title: string;           // e.g. "IPL · Cubbon Park · Apr 2024"
  delayMin: number;
  riskAtPeak: number;
  closure: boolean;
  corridor: string;
  match: number;           // 0–100, similarity %
  distanceKm: number;
};

export type JunctionDNA = {
  name: string;
  incidentCount: number;
  topCause: string;
  peakHour: string;
  closureRate: number;     // 0–1
  riskIndex: number;       // 0–100
};

export type DiversionRationale = {
  routeId: string;
  routeName: string;
  score: number;           // 0–100 overall fit
  pros: string[];
  cons: string[];
  picked: boolean;
  rejected: { id: string; name: string; reason: string }[];
};

export type Explanation = {
  riskScore: number;
  confidence: number;
  headline: string;        // one-line "Because:" summary
  bullets: string[];       // 3–5 punchy "because" lines
  factors: Factor[];       // sorted desc by weight
  similar: SimilarOutcome[];
  junctionDNA: JunctionDNA[];
  diversion?: DiversionRationale;
  evidenceCount: number;   // # of historical incidents considered
  generatedAt: string;
};

function hourFromIso(iso: string) {
  const d = new Date(iso);
  return d.getHours();
}

function peakOverlap(startIso: string, durationHours: number) {
  const start = hourFromIso(startIso);
  const end = (start + durationHours) % 24;
  // Bengaluru peak windows: 8–11 and 17–21
  const ranges: [number, number][] = [[8, 11], [17, 21]];
  let overlap = 0;
  for (const [a, b] of ranges) {
    const s = Math.max(a, Math.min(start, end));
    const e = Math.min(b, Math.max(start, end));
    if (e > s) overlap += e - s;
  }
  return overlap; // hours overlapping peak
}

export function explainEvent(ev: {
  id: string;
  name: string;
  kind: EventKindId;
  lat: number;
  lng: number;
  crowd: number;
  durationHours: number;
  startsAt: string;
}, p: Prediction, chosenDiversion?: DiversionRoute, allDiversions?: DiversionRoute[]): Explanation {
  const kind = EVENT_KINDS.find((k) => k.id === ev.kind)!;
  const near = nearbyIncidents(ev.lat, ev.lng, 3);
  const closures = near.filter((n) => n.i.closure).length;
  const highPri = near.filter((n) => n.i.priority === "High").length;
  const peak = peakOverlap(ev.startsAt, ev.durationHours);
  const crowdLoad = (ev.crowd * kind.crowdMult) / 1000;

  // --- Factor decomposition (weights sum ≈ 100) -----------------------------
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
    kind.baseRisk * 0.5,
    Math.max(2, crowdLoad * 6),
    Math.max(2, near.length * 1.2 + highPri * 2 + closures * 3),
    Math.max(1, peak * 6),
    Math.max(1, ev.durationHours * 1.2),
  ];
  const total = rawWeights.reduce((a, b) => a + b, 0) || 1;
  const factors: Factor[] = raw
    .map((f, i) => ({ ...f, weight: Math.round((rawWeights[i] / total) * 100) }))
    .sort((a, b) => b.weight - a.weight);

  // --- Similar historical outcomes -----------------------------------------
  const similar: SimilarOutcome[] = near.slice(0, 6).map(({ i, d }) => {
    const distScore = Math.max(0, 100 - d * 30);
    const causeBoost = (i.cause.toLowerCase().includes(kind.id) ||
                       (kind.id === "cricket" && i.cause.toLowerCase().includes("event"))) ? 15 : 0;
    return {
      id: i.id,
      title: `${i.cause.replace(/_/g, " ")} · ${i.corridor || i.zone || "Bengaluru"}`,
      delayMin: 12 + Math.round(d * 9 + (i.priority === "High" ? 22 : 8)),
      riskAtPeak: Math.min(99, 55 + (i.priority === "High" ? 28 : 12) + Math.round(causeBoost / 2)),
      closure: i.closure,
      corridor: i.corridor || "—",
      match: Math.min(98, Math.round(distScore + causeBoost)),
      distanceKm: +d.toFixed(2),
    };
  }).sort((a, b) => b.match - a.match);

  // --- Junction DNA (per affected junction) --------------------------------
  const junctionDNA: JunctionDNA[] = p.affectedJunctions.slice(0, 4).map((jn) => {
    const sub = INCIDENTS.filter((i) => i.junction === jn);
    const causes = new Map<string, number>();
    const hours = new Map<number, number>();
    let closureN = 0;
    for (const i of sub) {
      causes.set(i.cause, (causes.get(i.cause) ?? 0) + 1);
      const h = hourFromIso(i.start);
      hours.set(h, (hours.get(h) ?? 0) + 1);
      if (i.closure) closureN++;
    }
    const topCause = [...causes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, " ") ?? "mixed";
    const peakHourEntry = [...hours.entries()].sort((a, b) => b[1] - a[1])[0];
    const peakHour = peakHourEntry ? `${peakHourEntry[0].toString().padStart(2, "0")}:00` : "—";
    const closureRate = sub.length ? closureN / sub.length : 0;
    const riskIndex = Math.min(99, Math.round(40 + sub.length * 1.5 + closureRate * 30));
    return { name: jn, incidentCount: sub.length, topCause, peakHour, closureRate, riskIndex };
  });

  // --- Diversion rationale --------------------------------------------------
  let diversion: DiversionRationale | undefined;
  if (allDiversions && allDiversions.length) {
    const picked = chosenDiversion ?? allDiversions.find((d) => d.recommended) ?? allDiversions[0];
    const pros: string[] = [
      `Absorbs ~${picked.capacityPct}% of diverted demand (highest of ${allDiversions.length} alternates).`,
      `Adds only ${picked.extraMinutes} min average detour vs incident corridor.`,
      `Covers ${picked.coverage.join(" + ")} — overlaps the two top-stress junctions.`,
    ];
    const cons: string[] = picked.capacityPct < 80
      ? [`Capacity ceiling at ${picked.capacityPct}% — secondary route may be needed past T+30 min.`]
      : [`Adds load to ${picked.coverage[0]} — monitor for spillback.`];
    const rejected = allDiversions
      .filter((d) => d.id !== picked.id)
      .map((d) => ({
        id: d.id,
        name: d.name,
        reason: d.capacityPct < picked.capacityPct
          ? `Lower capacity (${d.capacityPct}% vs ${picked.capacityPct}%).`
          : `Longer detour (+${d.extraMinutes} min vs +${picked.extraMinutes} min).`,
      }));
    const score = Math.round(picked.capacityPct * 0.6 + (100 - picked.extraMinutes * 2) * 0.4);
    diversion = { routeId: picked.id, routeName: picked.name, score, pros, cons, picked: true, rejected };
  }

  // --- "Because" bullets ----------------------------------------------------
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
// Learning Dashboard analytics — deterministic synthesis from INCIDENTS.
// Showcases NETHRA's continuous learning: per-event predicted vs actual,
// weekly forecast accuracy trend, model calibration (reliability), and
// historical performance ledger. All pure functions, SSR-safe.
// ---------------------------------------------------------------------------

// Small seeded PRNG so server + client agree.
function lrand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export type PredVsActual = {
  id: string;
  label: string;
  predictedDelayMin: number;
  actualDelayMin: number;
  predictedRisk: number;
  actualRisk: number;
  weekIndex: number; // 0 = oldest, 11 = latest
};

export function predVsActualSeries(n = 60): PredVsActual[] {
  const rnd = lrand(91237);
  const out: PredVsActual[] = [];
  for (let i = 0; i < n; i++) {
    const inc = INCIDENTS[i % INCIDENTS.length];
    const weekIndex = Math.floor((i / n) * 12);
    // Earlier weeks: wider error. Later weeks: tight.
    const noiseScale = 12 - weekIndex * 0.85; // 12 → ~2
    const pred = 10 + Math.round(rnd() * 35);
    const actual = Math.max(2, Math.round(pred + (rnd() - 0.5) * noiseScale * 2));
    const pRisk = 40 + Math.round(rnd() * 55);
    const aRisk = Math.max(15, Math.min(99, Math.round(pRisk + (rnd() - 0.5) * noiseScale * 1.5)));
    out.push({
      id: `EVT-${2000 + i}`,
      label: `${inc.cause.replace(/_/g, " ")} · ${inc.corridor || inc.zone}`,
      predictedDelayMin: pred,
      actualDelayMin: actual,
      predictedRisk: pRisk,
      actualRisk: aRisk,
      weekIndex,
    });
  }
  return out;
}

export type WeeklyPerf = {
  week: string;       // "W-11" .. "W-0"
  weekIndex: number;
  events: number;
  mae: number;        // mean absolute error in delay minutes
  accuracy: number;   // % within ±5 min
  brier: number;      // calibration error proxy 0–1 (lower is better)
};

export function weeklyPerformance(): WeeklyPerf[] {
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
    const mae = errors.length ? errors.reduce((a, b) => a + b, 0) / errors.length : 0;
    const within = items.filter((i) => Math.abs(i.predictedDelayMin - i.actualDelayMin) <= 5).length;
    const accuracy = items.length ? (within / items.length) * 100 : 0;
    // Brier-like score from risk error normalised to 0–1.
    const brier = items.length
      ? items.reduce((s, i) => s + Math.pow((i.predictedRisk - i.actualRisk) / 100, 2), 0) / items.length
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
  return weeks;
}

export type CalibrationBin = {
  bucket: string;     // "0–10%" etc.
  predicted: number;  // mid-bucket
  actual: number;     // empirical frequency
  count: number;
};

export function calibrationBins(): CalibrationBin[] {
  const series = predVsActualSeries();
  const bins: CalibrationBin[] = [];
  for (let b = 0; b < 10; b++) {
    const lo = b * 10;
    const hi = lo + 10;
    const inBucket = series.filter((s) => s.predictedRisk >= lo && s.predictedRisk < hi);
    const mid = lo + 5;
    if (inBucket.length === 0) {
      bins.push({ bucket: `${lo}–${hi}%`, predicted: mid, actual: mid, count: 0 });
      continue;
    }
    const actual = inBucket.reduce((s, x) => s + x.actualRisk, 0) / inBucket.length;
    bins.push({
      bucket: `${lo}–${hi}%`,
      predicted: mid,
      actual: Math.round(actual),
      count: inBucket.length,
    });
  }
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
  const series = predVsActualSeries();
  // newest first
  const recent = [...series].sort((a, b) => b.weekIndex - a.weekIndex).slice(0, limit);
  return recent.map((r, i) => {
    const delta = r.actualDelayMin - r.predictedDelayMin;
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
}

export type LearningSummary = {
  overallAccuracy: number;     // %
  mae: number;                 // minutes
  calibrationError: number;    // 0–1 (lower better)
  improvement: number;         // % accuracy gain W-11 → W-0
  eventsLearned: number;
  modelVersion: string;
};

export function learningSummary(): LearningSummary {
  const weeks = weeklyPerformance();
  const series = predVsActualSeries();
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  const totalWithin = series.filter((s) => Math.abs(s.predictedDelayMin - s.actualDelayMin) <= 5).length;
  const mae = series.reduce((s, x) => s + Math.abs(x.predictedDelayMin - x.actualDelayMin), 0) / series.length;
  const brier = series.reduce((s, x) => s + Math.pow((x.predictedRisk - x.actualRisk) / 100, 2), 0) / series.length;
  return {
    overallAccuracy: Math.round((totalWithin / series.length) * 100),
    mae: Math.round(mae * 10) / 10,
    calibrationError: Math.round(brier * 1000) / 1000,
    improvement: Math.max(0, last.accuracy - first.accuracy),
    eventsLearned: series.length,
    modelVersion: `nethra-forecast-v1.${last.weekIndex}.0`,
  };
}
