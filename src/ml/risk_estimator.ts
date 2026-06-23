import type { Incident, EventKindId } from "@/lib/intel";
import { EVENT_KINDS } from "@/lib/intel";
import { getAstramIndex } from "@/ml/astram_index";
import {
  engineerAstamFeatures,
  findSimilarIncidents,
  scoreWithLightGbm,
  type AstamFeatureBundle,
} from "@/ml/astram_pipeline";
import { safeNumber } from "@/ml/safe_number";

export type RiskEstimate = {
  riskScore: number;
  confidence: number;
  delayMinutes: number;
  impactRadiusKm: number;
  affectedJunctions: string[];
  affectedCorridors: string[];
  affectedStations: string[];
  similarIncidents: Incident[];
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, safeNumber(n)));
}

export function estimateRisk(params: {
  kind: EventKindId;
  lat: number;
  lng: number;
  crowd: number;
  durationHours: number;
}): RiskEstimate {
  const { kind, crowd, durationHours } = params;
  const kindMeta = EVENT_KINDS.find((k) => k.id === kind)!;
  const idx = getAstramIndex();

  const radiusKm = safeNumber(2.5 + (safeNumber(durationHours) / 4) * 0.8);
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat0 = safeNumber(params.lat);
  const lng0 = safeNumber(params.lng);

  const within = idx.all
    .map((inc) => {
      const dLat = toRad(inc.lat - lat0);
      const dLng = toRad(inc.lng - lng0);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat0)) * Math.cos(toRad(inc.lat)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.asin(Math.sqrt(a));
      const dKm = safeNumber(R * c);
      return { inc, dKm };
    })
    .filter((x) => x.dKm <= radiusKm)
    .sort((a, b) => a.dKm - b.dKm);

  const closeBy = within.slice(0, 60).map((x) => x.inc);
  const featureBundle = engineerAstamFeatures({
    kindBaseRisk: kindMeta.baseRisk,
    kindCrowdMult: kindMeta.crowdMult,
    crowd,
    durationHours,
    nearby: within.slice(0, 60),
    radiusKm,
  });

  const scored = scoreWithLightGbm(featureBundle);
  const riskScore = scored.riskScore;
  const confidence = scored.confidence;
  const impactRadiusKm = scored.impactRadiusKm;
  const delayMinutes = scored.delayMinutes;

  const topN = <T,>(m: Map<T, number>, n: number) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map((x) => x[0]);

  const corridorMix = new Map<string, number>();
  const junctionMix = new Map<string, number>();
  const stationMix = new Map<string, number>();

  for (const inc of closeBy) {
    if (inc.corridor) corridorMix.set(inc.corridor, (corridorMix.get(inc.corridor) ?? 0) + 1);
    if (inc.junction && inc.junction !== "NULL")
      junctionMix.set(inc.junction, (junctionMix.get(inc.junction) ?? 0) + 1);
    if (inc.station) stationMix.set(inc.station, (stationMix.get(inc.station) ?? 0) + 1);
  }

  const affectedCorridors = topN(corridorMix, 3);
  const affectedJunctions = topN(junctionMix, 4);
  const affectedStations = topN(stationMix, 3);

  const similarIncidents = findSimilarIncidents({
    query: { lat: params.lat, lng: params.lng, radiusKm },
    incidents: idx.all,
    limit: 5,
  });

  return {
    riskScore,
    confidence,
    delayMinutes,
    impactRadiusKm,
    affectedJunctions,
    affectedCorridors,
    affectedStations,
    similarIncidents,
  };
}

