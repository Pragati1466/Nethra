import type { Incident, EventKindId } from "@/lib/intel";
import { EVENT_KINDS } from "@/lib/intel";
import { getAstramIndex } from "@/ml/astram_index";
import { engineerAstamFeatures, scoreWithLightGbm } from "@/ml/astram_pipeline";
import { safeDivide, safeNumber } from "@/ml/safe_number";

export type LearnPredActual = {
  predictedDelayMin: number;
  actualDelayMin: number;
  predictedRisk: number;
  actualRisk: number;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, safeNumber(n)));
}

function normalizeCause(cause: string) {
  return cause.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function incidentSeverity(inc: Incident) {
  const causeWeights: Record<string, number> = {
    accident: 1.45,
    vehicle_breakdown: 0.92,
    water_logging: 1.25,
    construction: 1.02,
    public_event: 1.18,
    procession: 1.14,
    protest: 1.26,
    vip_movement: 1.1,
    pot_holes: 0.88,
    congestion: 0.95,
    road_conditions: 0.9,
    tree_fall: 0.86,
    debris: 0.8,
    others: 0.78,
    test_demo: 0.7,
    fog_low_visibility: 1.18,
  };

  const priorityWeights: Record<string, number> = {
    high: 1.2,
    medium: 1.0,
    low: 0.82,
  };

  const causeWeight = causeWeights[normalizeCause(inc.cause)] ?? 1;
  const priorityWeight = priorityWeights[inc.priority.toLowerCase()] ?? 1;
  const closureFactor = inc.closure ? 1.08 : 0.94;
  const corridorFactor = inc.corridor && inc.corridor !== "Non-corridor" ? 1.05 : 0.95;

  return causeWeight * priorityWeight * closureFactor * corridorFactor;
}

export function derivePredVsActualFromAstam(params: {
  kind: EventKindId;
  junction?: string;
}): LearnPredActual {
  const idx = getAstramIndex();
  const pool = params.junction ? idx.byJunction.get(params.junction) ?? [] : idx.all;
  const filtered = pool.slice(0, 160);
  const kindMeta = EVENT_KINDS.find((k) => k.id === params.kind)!;

  const density = filtered.length;
  const meanSeverity = safeDivide(
    filtered.reduce((sum, inc) => sum + safeNumber(incidentSeverity(inc)), 0),
    Math.max(1, filtered.length),
  );
  const escalation = filtered.some((inc) => inc.priority.toLowerCase() === "high") ? 6 : 0;
  const closureHit = filtered.some((inc) => inc.closure) ? 3 : 0;
  const corridorHit = filtered.some((inc) => inc.corridor && inc.corridor !== "Non-corridor") ? 2 : 0;

  const nearby = filtered.slice(0, 20).map((inc, index) => ({ inc, dKm: Math.max(0.2, 0.4 + index * 0.15) }));
  const featureBundle = engineerAstamFeatures({
    kindBaseRisk: kindMeta.baseRisk,
    kindCrowdMult: kindMeta.crowdMult,
    crowd: 12000,
    durationHours: 4,
    nearby,
    radiusKm: 2.5,
  });
  const scored = scoreWithLightGbm(featureBundle);

  const predictedDelayMin = clamp(scored.delayMinutes, 2, 120);
  const predictedRisk = clamp(scored.riskScore, 15, 98);

  const actualDelayMin = clamp(
    Math.round(safeNumber(predictedDelayMin) + safeNumber(meanSeverity) * 5 + escalation + closureHit + corridorHit + (density > 25 ? 4 : 0)),
    2,
    140,
  );

  const actualRisk = clamp(
    Math.round(
      safeNumber(predictedRisk) + Math.max(-7, Math.min(12, (safeNumber(actualDelayMin) - safeNumber(predictedDelayMin)) * 0.4)) + (escalation ? 4 : 0) + (closureHit ? -2 : 1),
    ),
    15,
    99,
  );

  return { predictedDelayMin, actualDelayMin, predictedRisk, actualRisk };
}

export type CalibrationPoint = {
  predictedRisk: number;
  actualRisk: number;
};

export function buildCalibrationPoints(kind: EventKindId, limit = 60): CalibrationPoint[] {
  const idx = getAstramIndex();
  const incidents = idx.all;
  const out: CalibrationPoint[] = [];
  for (let i = 0; i < Math.min(limit, incidents.length); i++) {
    const inc = incidents[i] as Incident;
    const pair = derivePredVsActualFromAstam({ kind, junction: inc.junction });
    out.push({ predictedRisk: pair.predictedRisk, actualRisk: pair.actualRisk });
  }
  return out;
}

