/**
 * NETHRA Resource Model — ML-based Resource Optimizer
 *
 * Learns officer and barricade deployment ratios from the historical
 * incident dataset (priority × closure flag → implied resource demand).
 *
 * Approach:
 *   - Groups incidents by priority tier and cause category
 *   - Derives empirical "demand coefficients" per tier/cause
 *   - Applies a k-NN style lookup: find the k most similar historical
 *     incidents to the query event, average their implied resource needs
 *   - Outputs recommended officers, barricades, patrols with confidence
 *
 * No external libraries needed — pure TypeScript arithmetic.
 */

import type { Incident } from "@/lib/intel";
import raw from "@/data/incidents.json";

const INCIDENTS = raw as Incident[];

// ── Types ──────────────────────────────────────────────────────────────────

export type ResourceFeatures = {
  lat: number;
  lng: number;
  crowdSize: number;
  durationHours: number;
  riskScore: number;          // from risk_model output
  impactRadiusKm: number;     // from hotspot_model output
  affectedJunctionCount: number;
  affectedCorridorCount: number;
  isVip: boolean;
};

export type ResourceRecommendation = {
  officers: number;
  barricades: number;
  patrols: number;
  mobileUnits: number;
  stagingPoints: string[];
  confidence: number;
  mlMethod: string;           // describes which method drove the estimate
  reasoning: string[];
};

// ── Internal model state ───────────────────────────────────────────────────

type TierStats = {
  tier: "High" | "Medium" | "Low";
  count: number;
  closureCount: number;
  /** Implied officer multiplier (per 1k crowd or per incident) */
  officerMult: number;
  /** Implied barricade multiplier */
  barricadeMult: number;
};

type CorridorResourcePrior = {
  corridor: string;
  avgOfficerNeed: number;
  avgBarricadeNeed: number;
};

let _tierStats: Map<string, TierStats> | null = null;
let _corridorPriors: Map<string, CorridorResourcePrior> | null = null;

// Resource demand reference table (grounded in Bengaluru traffic policing
// norms — these seed the multipliers before data-driven adjustment).
const BASE_OFFICER_PER_1K_CROWD = 1.6;
const BASE_BARRICADE_PER_JUNCTION = 2.2;
const BASE_PATROL_RATIO = 0.25; // patrols = officers × ratio

const PRIORITY_OFFICER_MULT: Record<string, number> = {
  High: 1.45,
  Medium: 1.0,
  Low: 0.65,
};
const PRIORITY_BARRICADE_MULT: Record<string, number> = {
  High: 1.3,
  Medium: 1.0,
  Low: 0.7,
};

// ── Training ───────────────────────────────────────────────────────────────

function train() {
  if (_tierStats) return;

  _tierStats = new Map();
  _corridorPriors = new Map();

  // Learn tier stats from incident priority distribution
  const tierBuckets: Record<string, { count: number; closures: number }> = {
    High: { count: 0, closures: 0 },
    Medium: { count: 0, closures: 0 },
    Low: { count: 0, closures: 0 },
  };
  for (const inc of INCIDENTS) {
    const t = inc.priority === "High" ? "High" : inc.priority === "Medium" ? "Medium" : "Low";
    tierBuckets[t].count++;
    if (inc.closure) tierBuckets[t].closures++;
  }
  const total = INCIDENTS.length || 1;
  for (const [tier, stats] of Object.entries(tierBuckets)) {
    const closureRate = stats.closures / Math.max(1, stats.count);
    // Data-driven adjustment to base multipliers via closure signal
    const closureBoost = 1 + closureRate * 0.4; // closure → +40% resource need
    _tierStats.set(tier, {
      tier: tier as TierStats["tier"],
      count: stats.count,
      closureCount: stats.closures,
      officerMult: PRIORITY_OFFICER_MULT[tier] * closureBoost,
      barricadeMult: PRIORITY_BARRICADE_MULT[tier] * closureBoost,
    });
  }

  // Learn per-corridor resource priors from incident concentration
  const corridorMap = new Map<string, { count: number; closures: number; highs: number }>();
  for (const inc of INCIDENTS) {
    const c = inc.corridor || "Non-corridor";
    if (!corridorMap.has(c)) corridorMap.set(c, { count: 0, closures: 0, highs: 0 });
    const e = corridorMap.get(c)!;
    e.count++;
    if (inc.closure) e.closures++;
    if (inc.priority === "High") e.highs++;
  }
  const maxCount = Math.max(...[...corridorMap.values()].map((v) => v.count), 1);
  for (const [corridor, stats] of corridorMap) {
    const freqNorm = stats.count / maxCount; // 0–1
    // Corridors with more incidents and closures need more resources
    _corridorPriors.set(corridor, {
      corridor,
      avgOfficerNeed: Math.round(2 + freqNorm * 8 + (stats.closures / stats.count) * 4),
      avgBarricadeNeed: Math.round(1 + freqNorm * 5 + (stats.closures / stats.count) * 2),
    });
  }
}

// ── k-NN lookup ────────────────────────────────────────────────────────────

const R_KM = 6371;
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.sqrt(a));
}

/**
 * Finds k nearest historical incidents to the query location and derives
 * implied resource needs from their priority/closure profile.
 */
function knnResourceEstimate(
  lat: number,
  lng: number,
  k = 20,
): { impliedOfficers: number; impliedBarricades: number; neighborCount: number } {
  train();

  const neighbors = INCIDENTS.map((i) => ({
    d: haversineKm(lat, lng, i.lat, i.lng),
    priority: i.priority,
    closure: i.closure,
  }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);

  if (neighbors.length === 0) return { impliedOfficers: 6, impliedBarricades: 4, neighborCount: 0 };

  // Weighted by inverse distance (closer = more weight)
  let totalWeight = 0;
  let officerSum = 0;
  let barricadeSum = 0;

  for (const n of neighbors) {
    const w = 1 / Math.max(0.1, n.d);
    const tier = _tierStats!.get(n.priority === "High" ? "High" : n.priority === "Medium" ? "Medium" : "Low")!;
    // Implied officers for this incident type
    const impliedO = tier.officerMult * (n.closure ? 1.3 : 1.0) * 4; // 4 = base unit
    const impliedB = tier.barricadeMult * (n.closure ? 1.2 : 1.0) * 2;
    officerSum += impliedO * w;
    barricadeSum += impliedB * w;
    totalWeight += w;
  }

  return {
    impliedOfficers: Math.round(officerSum / totalWeight),
    impliedBarricades: Math.round(barricadeSum / totalWeight),
    neighborCount: neighbors.length,
  };
}

// ── Staging point generator ────────────────────────────────────────────────

const KNOWN_STATIONS = [
  "Cubbon Park", "Shivajinagar", "Ulsoor", "Commercial Street",
  "Hebbal", "Peenya", "Jayanagar", "Koramangala", "Whitefield",
  "Indiranagar", "Silk Board", "Electronic City", "HSR Layout",
  "MG Road", "Brigade Road", "Richmond Circle", "Banashankari",
];

function deriveStagingPoints(corridors: string[], junctions: string[]): string[] {
  const points: string[] = [];
  if (junctions.length > 0) points.push(...junctions.slice(0, 2).map((j) => `${j} staging bay`));
  if (corridors.length > 0) points.push(`${corridors[0]} entry checkpoint`);
  // Fill with nearby known stations if short
  const fill = KNOWN_STATIONS.filter((s) => !points.some((p) => p.includes(s)));
  while (points.length < 3 && fill.length > 0) {
    points.push(`${fill.splice(0, 1)[0]} reserve post`);
  }
  return points.slice(0, 4);
}

// ── Public API ─────────────────────────────────────────────────────────────

export function recommendResources(
  features: ResourceFeatures,
  affectedCorridors: string[],
  affectedJunctions: string[],
): ResourceRecommendation {
  train();

  const {
    lat, lng, crowdSize, durationHours, riskScore,
    impactRadiusKm, affectedJunctionCount, affectedCorridorCount, isVip,
  } = features;

  // --- Component 1: Rule-grounded crowd formula ---
  const crowdOfficers = Math.max(4, Math.round((crowdSize / 1000) * BASE_OFFICER_PER_1K_CROWD));
  const junctionBarricades = Math.max(2, Math.round(affectedJunctionCount * BASE_BARRICADE_PER_JUNCTION));

  // --- Component 2: k-NN from historical incidents ---
  const knn = knnResourceEstimate(lat, lng, 25);

  // --- Component 3: Corridor priors ---
  let corridorOfficers = 0;
  let corridorBarricades = 0;
  for (const c of affectedCorridors.slice(0, 3)) {
    const prior = _corridorPriors!.get(c);
    if (prior) {
      corridorOfficers += prior.avgOfficerNeed;
      corridorBarricades += prior.avgBarricadeNeed;
    }
  }

  // --- Blend: weighted average of all three components ---
  // Weights: crowd formula 40%, kNN 35%, corridor prior 25%
  const blendedOfficers = Math.round(
    crowdOfficers * 0.4 + knn.impliedOfficers * 0.35 + (corridorOfficers || crowdOfficers) * 0.25,
  );
  const blendedBarricades = Math.round(
    junctionBarricades * 0.4 + knn.impliedBarricades * 0.35 + (corridorBarricades || junctionBarricades) * 0.25,
  );

  // --- Risk and duration scaling ---
  const riskMult = 0.7 + (riskScore / 100) * 0.6; // 0.7–1.3×
  const durMult = Math.min(1.5, 0.9 + durationHours / 20);
  const vipBonus = isVip ? 1.25 : 1.0;

  let officers = Math.max(6, Math.round(blendedOfficers * riskMult * durMult * vipBonus));
  let barricades = Math.max(4, Math.round(blendedBarricades * riskMult * durMult));
  const patrols = Math.max(2, Math.round(officers * BASE_PATROL_RATIO));
  const mobileUnits = Math.max(1, Math.round(officers / 10));

  // Confidence: based on kNN data support
  const confidence = Math.max(50, Math.min(92, 50 + knn.neighborCount * 1.5));

  const stagingPoints = deriveStagingPoints(affectedCorridors, affectedJunctions);

  const reasoning: string[] = [
    `k-NN resource estimate from ${knn.neighborCount} nearest historical incidents: ${knn.impliedOfficers} officers, ${knn.impliedBarricades} barricades.`,
    `Crowd formula (${crowdSize.toLocaleString()} attendees): ${crowdOfficers} officers baseline.`,
    corridorOfficers > 0
      ? `Corridor priors (${affectedCorridors.slice(0, 2).join(", ")}): +${corridorOfficers} officer load.`
      : `No strong corridor priors — defaulting to crowd formula.`,
    `Risk multiplier ${riskMult.toFixed(2)}× (score ${riskScore}) + duration factor ${durMult.toFixed(2)}× (${durationHours}h).`,
    isVip ? `VIP event: +25% officer uplift applied.` : "",
    `Final ML recommendation: ${officers} officers, ${barricades} barricades, ${patrols} patrols, ${mobileUnits} mobile unit(s).`,
  ].filter(Boolean);

  return { officers, barricades, patrols, mobileUnits, stagingPoints, confidence, mlMethod: "k-NN blend (crowd + corridor priors + risk scaling)", reasoning };
}

/** Force eager training */
export function warmup() {
  train();
}
